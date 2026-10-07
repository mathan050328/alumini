package com.alumniconnect.service;

import com.alumniconnect.exception.BadRequestException;
import com.alumniconnect.exception.FileStorageException;
import com.alumniconnect.util.AppConstants;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    @Value("${app.file.upload-dir:uploads}")
    private String uploadDir;

    private Path fileStorageLocation;

    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
            Files.createDirectories(this.fileStorageLocation.resolve("profiles"));
            Files.createDirectories(this.fileStorageLocation.resolve("resumes"));
        } catch (Exception ex) {
            throw new FileStorageException("Could not create upload directory", ex);
        }
    }

    public String storeProfilePicture(MultipartFile file) {
        validateFile(file, AppConstants.MAX_PROFILE_PIC_SIZE, AppConstants.ALLOWED_IMAGE_TYPES);
        return storeFile(file, "profiles");
    }

    public String storeResume(MultipartFile file) {
        validateFile(file, AppConstants.MAX_RESUME_SIZE, AppConstants.ALLOWED_RESUME_TYPES);
        return storeFile(file, "resumes");
    }

    private String storeFile(MultipartFile file, String subDirectory) {
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");

        if (originalFilename.contains("..")) {
            throw new BadRequestException("Filename contains invalid path sequence " + originalFilename);
        }

        String fileExtension = "";
        int extIndex = originalFilename.lastIndexOf('.');
        if (extIndex >= 0) {
            fileExtension = originalFilename.substring(extIndex);
        }

        String storedFileName = UUID.randomUUID().toString() + fileExtension;

        try {
            Path targetLocation = this.fileStorageLocation.resolve(subDirectory).resolve(storedFileName);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }
            // Return accessible relative URL/path
            return "/uploads/" + subDirectory + "/" + storedFileName;
        } catch (IOException ex) {
            throw new FileStorageException("Could not store file " + storedFileName + ". Please try again!", ex);
        }
    }

    private void validateFile(MultipartFile file, long maxSizeBytes, String[] allowedTypes) {
        if (file.isEmpty()) {
            throw new BadRequestException("Failed to store empty file");
        }

        if (file.getSize() > maxSizeBytes) {
            throw new BadRequestException("File size exceeds the maximum allowed limit of " + (maxSizeBytes / (1024 * 1024)) + "MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !Arrays.asList(allowedTypes).contains(contentType)) {
            throw new BadRequestException("Invalid file type: " + contentType + ". Allowed types: " + Arrays.toString(allowedTypes));
        }
    }
}
