package com.example.learnermanagement.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Upload and stream lesson videos.
 *   POST /api/videos          (multipart field "file")  -> { "url": "/api/videos/<id>.mp4", "fileName": "..." }
 *   GET  /api/videos/{name}   streams the file (supports Range requests so the player can seek)
 */
@RestController
@RequestMapping("/api/videos")
@CrossOrigin
public class VideoController {

    private static final Set<String> ALLOWED = Set.of("mp4", "webm", "ogg", "mov", "m4v");

    private final Path root;

    public VideoController(@Value("${app.upload-dir:uploads/videos}") String uploadDir) throws IOException {
        this.root = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(root);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please choose a video file."));
        }

        String original = StringUtils.cleanPath(file.getOriginalFilename() == null ? "video" : file.getOriginalFilename());
        String ext = extensionOf(original);
        if (!ALLOWED.contains(ext)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Unsupported format. Use MP4, WebM, OGG, MOV or M4V."));
        }

        String stored = UUID.randomUUID() + "." + ext;
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, root.resolve(stored), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Could not save the video."));
        }

        return ResponseEntity.ok(Map.of("url", "/api/videos/" + stored, "fileName", original));
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> serve(@PathVariable String filename) throws MalformedURLException {
        Path file = root.resolve(filename).normalize();
        if (!file.startsWith(root) || !Files.isRegularFile(file) || !Files.isReadable(file)) {
            return ResponseEntity.notFound().build();
        }

        MediaType type = switch (extensionOf(filename)) {
            case "webm" -> MediaType.parseMediaType("video/webm");
            case "ogg" -> MediaType.parseMediaType("video/ogg");
            case "mov" -> MediaType.parseMediaType("video/quicktime");
            default -> MediaType.parseMediaType("video/mp4");
        };

        return ResponseEntity.ok()
                .contentType(type)
                .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                .body(new UrlResource(file.toUri()));
    }

    private static String extensionOf(String name) {
        int dot = name.lastIndexOf('.');
        return dot < 0 ? "" : name.substring(dot + 1).toLowerCase();
    }
}
