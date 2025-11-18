"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveUploadedFile = moveUploadedFile;
/**
 * @author Vivian NKOUANANG (https://github.com/vporel) <dev.vporel@gmail.com>
 */
const path = require("path");
const mime = require("mime-types");
const fs_1 = require("fs");
/**
 *
 * @param file
 * @param fileNameToSave without extension
 * @param destFolder
 */
function moveUploadedFile(file, baseName, destFolder) {
    let extension = path.extname(file.filename ?? file.originalname).toLowerCase();
    if (!extension || extension == "")
        extension = mime.extension(file.mimetype);
    if (!(0, fs_1.existsSync)(destFolder))
        (0, fs_1.mkdirSync)(destFolder, { recursive: true });
    const newFileName = baseName + (extension.startsWith(".") ? "" : ".") + extension;
    const destPath = path.join(destFolder, newFileName);
    if (file.path)
        (0, fs_1.renameSync)(file.path, destPath);
    else
        (0, fs_1.writeFileSync)(destPath, file.buffer);
    return newFileName;
}
