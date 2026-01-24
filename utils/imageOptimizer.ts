
/**
 * Compresses an image file to a smaller Data URL string.
 * Max Width: 800px
 * Quality: 0.7 (70%)
 * Output: image/jpeg
 */
export const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resize logic (Max width 800px)
                const MAX_WIDTH = 800;
                if (width > MAX_WIDTH) {
                    height = (height * MAX_WIDTH) / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error("Could not get canvas context"));
                    return;
                }

                // Smooth scaling
                ctx.fillStyle = 'white'; // Fill transparent backgrounds (e.g. PNGs)
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                // Compress to JPEG at 70% quality
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

                // Debug Logging
                const originalSize = (file.size / 1024).toFixed(2);
                const compressedSize = (dataUrl.length * 0.75 / 1024).toFixed(2); // Approx base64 size
                console.log(`%c Image Optimized! 🚀`, 'color: #10B981; font-weight: bold; font-size: 12px');
                console.log(`Original: ${originalSize} KB`);
                console.log(`Compressed: ${compressedSize} KB`);
                console.log(`Saved: ${((1 - (Number(compressedSize) / Number(originalSize))) * 100).toFixed(0)}% space`);

                resolve(dataUrl);
            };

            img.onerror = (err) => reject(err);
        };

        reader.onerror = (err) => reject(err);
    });
};
