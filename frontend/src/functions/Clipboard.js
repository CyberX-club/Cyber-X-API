class Clipboard{
    static copyToClipboard(text,onSuccess,onError){
        navigator.clipboard.writeText(text).then(() => {
            console.log('Text copied to clipboard');
            if(onSuccess){
                onSuccess(text);
            }
        }).catch((error) => {
            console.error('Error copying text: ', error);
            if(onError){
                onError(text,error);
            }
        });
    }
}

export default Clipboard;