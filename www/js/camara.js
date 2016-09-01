function getDataUri(url, Width, Height, callback)
{
    var image = new Image();

    image.setAttribute('crossOrigin', 'anonymous');

    image.onload = function ()
    {
        var canvas = document.createElement('canvas');
        canvas.width = Width; //* (Width / this.naturalWidth); // or 'width' if you want a special/scaled size
        canvas.height = Height; //* (Height / this.naturalHeight); // or 'height' if you want a special/scaled size*/

        canvas.getContext('2d').drawImage(this, 0, 0, Width, Height);

        // Get raw image data
        callback(canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, ''));
        

        // ... or get as Data URI
        //callback(canvas.toDataURL('image/png'));
    };

    image.src = url;
}

function tomarFoto(fuente, callback) {
        /*navigator.camera.getPicture(onSuccess, onFail,
            {
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                correctOrientation: true,
                saveToPhotoAlbum: true
            });*/
        navigator.camera.getPicture(onSuccess, onFail,
            {
                quality: 50,
                //targetWidth: 500,
                //targetHeight: 500,
                allowEdit: true,
                destinationType: Camera.DestinationType.FILE_URI,
                pictureSource: fuente,
                encodingType: Camera.EncodingType.JPEG,
                saveToPhotoAlbum: true
                //popoverOptions: new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY)
            });

        function onSuccess(imageData)
        {
            callback(imageData);
        }

        function onFail(message) {
            Mensage('Failed because: ' + message);
        }
   
}