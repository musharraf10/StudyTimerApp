import * as FileSystem from "expo-file-system";
import * as Asset from "expo-asset";

const assetFiles = [
  require("../assets/pdfjs/web/viewer.html"),
  require("../assets/pdfjs/web/viewer.js"),
  require("../assets/pdfjs/web/viewer.css"),
  require("../assets/pdfjs/build/pdf.js"),
  require("../assets/pdfjs/build/pdf.worker.js"),
  // add other needed assets here
];

export const copyPdfViewerAssets = async () => {
  const targetDir = FileSystem.documentDirectory + "pdfjs/web/";

  try {
    const dirInfo = await FileSystem.getInfoAsync(targetDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(targetDir, { intermediates: true });
    }
  } catch (e) {
    console.warn("Error creating directory", e);
  }

  for (const assetModule of assetFiles) {
    const asset = Asset.fromModule(assetModule);
    await asset.downloadAsync();

    // Extract filename from localUri
    const fileName = asset.localUri.split("/").pop().split("?")[0];
    const targetPath = targetDir + fileName;

    const fileInfo = await FileSystem.getInfoAsync(targetPath);
    if (!fileInfo.exists) {
      try {
        await FileSystem.copyAsync({
          from: asset.localUri,
          to: targetPath,
        });
        console.log(`Copied ${fileName} to ${targetPath}`);
      } catch (copyError) {
        console.warn(`Failed to copy ${fileName}`, copyError);
      }
    } else {
      console.log(`${fileName} already exists at ${targetPath}`);
    }
  }
};
