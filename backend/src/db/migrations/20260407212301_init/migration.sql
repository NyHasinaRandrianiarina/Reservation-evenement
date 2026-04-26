-- CreateTable
CREATE TABLE `OtpCode` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(255) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `type` ENUM('TWO_FA', 'PASSWORD_RESET', 'EMAIL_VERIFICATION') NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `used_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OtpCode_user_id_idx`(`user_id`),
    INDEX `OtpCode_code_user_id_idx`(`code`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RefreshToken` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(500) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `user_agent` VARCHAR(255) NULL,
    `ip_address` VARCHAR(45) NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `revoked_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `RefreshToken_token_key`(`token`),
    INDEX `RefreshToken_user_id_idx`(`user_id`),
    INDEX `RefreshToken_token_idx`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shop` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `logo_url` VARCHAR(191) NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Shop_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `avatar_url` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `is_seller` BOOLEAN NOT NULL DEFAULT false,
    `onboarding_completed` BOOLEAN NOT NULL DEFAULT false,
    `role` ENUM('BUYER', 'SELLER', 'ADMIN') NOT NULL DEFAULT 'BUYER',
    `two_fa_enabled` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
