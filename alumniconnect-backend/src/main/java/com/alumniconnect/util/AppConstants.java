package com.alumniconnect.util;

/**
 * Application-wide constants.
 */
public class AppConstants {

    private AppConstants() {}

    public static final String DEFAULT_PAGE_NUMBER = "0";
    public static final String DEFAULT_PAGE_SIZE = "10";
    public static final int MAX_PAGE_SIZE = 50;

    public static final String SORT_BY_DEFAULT = "createdAt";
    public static final String SORT_DIR_DEFAULT = "desc";

    // JWT Header
    public static final String AUTH_HEADER = "Authorization";
    public static final String TOKEN_PREFIX = "Bearer ";

    // File upload constraints
    public static final long MAX_PROFILE_PIC_SIZE = 5 * 1024 * 1024L;   // 5MB
    public static final long MAX_RESUME_SIZE = 10 * 1024 * 1024L;        // 10MB
    public static final String[] ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"};
    public static final String[] ALLOWED_RESUME_TYPES = {"application/pdf"};
}
