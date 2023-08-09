import { LightningElement,track } from 'lwc';

export default class Sample2 extends LightningElement {

    @track imageData;
    @track parsedText;

    handleFileChange(event) {
        const selectedFile = event.target.files[0];

        if (selectedFile) {
            const fileReader = new FileReader();
            fileReader.onload = () => {
                this.imageData = fileReader.result;
            };
            fileReader.readAsDataURL(selectedFile);
        } else {
            this.imageData = null;
        }
    }

    async handleImageParsing() {
        const apiEndpoint = 'https://api.ocr.space/parse/image';
        const apiKey = 'K86091401088957';

        const formData = new FormData();
        formData.append("file", this.dataURLtoFile(this.imageData));
        formData.append("language", "eng");
        formData.append("apikey", apiKey);
        formData.append("isOverlayRequired", true);

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                this.parsedText = [{ lineIndex: 0, text: 'Error occurred while processing the image.' }];
                return;
            }

            const ocrParsedResult = await response.json();
            const parsedResults = ocrParsedResult["ParsedResults"];

            if (parsedResults) {
                this.parsedText = [];
                parsedResults.forEach((parsedResult) => {
                    const textOverlay=parsedResult["TextOverlay"];
                    if(textOverlay && textOverlay["Lines"]){
                        const lines = textOverlay["Lines"];
                    lines.forEach((line, index) => {
                        this.parsedText.push({ lineIndex: index, text: line["LineText"] });
                    });
                }
                });
            } else{
                this.parsedText=[{lineIndex: index, text: 'No text found'}];
            }
        } catch (error) {
            console.error('Error:', error);
            this.parsedText = [{ lineIndex: 0, text: 'Error occurred while processing the image.' }];
        }
    }

    // Helper function to convert data URL to a File object
    dataURLtoFile(dataUrl) {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], 'image.png', { type: mime });
    }
}