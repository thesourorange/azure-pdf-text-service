/**
  *JQuery - Document Ready
  */
 var pdfFile = null;
 var speechTranscript = '';
 var recognizer = null;
 var state = 0;

 /**
  * Show Tab
  */
function showTab(e, tab) {
    var iTab, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (iTab = 0; iTab < tabcontent.length; iTab++) {
        tabcontent[iTab].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (iTab = 0; iTab < tablinks.length; iTab++) {
        tablinks[iTab].className = tablinks[iTab].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tab).style.display = "block";
    evt.currentTarget.className += " active";
}

function convert(pdfContent) {
 
    console.log('started conversion');
    var self = this;
    var complete = 0;

    var structure = $('#structure')[0];  
    var content = $('#content')[0];
        
    while (structure.firstChild) {
        structure.removeChild(structure.firstChild);
    }

    while (content.firstChild) {
        content.removeChild(content.firstChild);
    }

    var pdf = new PDFJS.PDFDoc(pdfContent);
    var total = pdf.numPages;

    console.log('Pages: ' + total);
    
    for (iPage = 1; iPage <= total; iPage++) {
        var page = pdf.getPage(iPage);
        var canvas = document.createElement('canvas');
        canvas.id = 'page' + iPage;
        canvas.mozOpaque = true;
        structure.appendChild(canvas);
    
        canvas.width = page.width;
        canvas.height = page.height;
    
        var context = canvas.getContext('2d');

        context.fillStyle = 'rgb(255, 255, 255)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.restore();

        var textLayer = document.createElement('div');
        textLayer.className = 'textLayer';

        content.appendChild(textLayer);
               
        page.startRendering(context, function() {

           if (++complete == total){ 
                console.log("Finished rendering. Extracting text...");
            
                window.setTimeout(function(){
                    var layers = [];
                    var nodes = document.querySelectorAll(".textLayer > div");
                    for (var j = 0; j < nodes.length; j++) {
                        layers.push(nodes[j].textContent + "\n");
                    }
                    
                    $('#structureFrame').css('display', 'inline-block');
                    $('#tab').css('visibility', 'visible');
                    $('#actions').css('visibility', 'visible');
             
                }, 100);

            }
        }, textLayer);
    
    }

    this.setMessage = function(text){
        console.log(text);
    }
    
    console.log('completed conversion');

}

$('#copyBtn').on('click', function(e) {
    var el = document.getElementsByClassName('textLayer');
    var range = document.createRange();

    for (var iEl in el) {
        if  (el[iEl] instanceof HTMLElement) {
            range.selectNodeContents(el[iEl]);
            alert(el[iEl].nodeValue)
        }
    }
 
    var sel = window.getSelection();
 
    sel.removeAllRanges();
    
    sel.addRange(range);
    document.execCommand('copy');
    
    alert('Contents copied to Clipboard');

    return false;

 });

$(document).ready(function() {
    var header = $('#caption').html();
    var dropzone = $('#droparea');
     
    dropzone.on('dragover', function() {
        //add hover class when drag over
        dropzone.addClass('hover');
        return false;
    });
     
    dropzone.on('dragleave', function() {
        //remove hover class when drag out
        dropzone.removeClass('hover');
        return false;
    });
     
    dropzone.on('drop', function(e) {
        //prevent browser from open the file when drop off
        e.stopPropagation();
        e.preventDefault();
        dropzone.removeClass('hover');
     
        //retrieve uploaded files data
        var files = e.originalEvent.dataTransfer.files;
        processFiles(files);
     
        return false;
    });

    var uploadBtn = $('#uploadbtn');
    var defaultUploadBtn = $('#upload');
     
    uploadBtn.on('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        defaultUploadBtn.click();
    });
     
    defaultUploadBtn.on('change', function() {
        var files = $(this)[0].files;

        processFiles(files);   

        return false;

    });

	var processFiles = function(files) {
 
 		if (files && typeof FileReader !== "undefined") {
			for(var iFile = 0; iFile<files.length; iFile++) {
			    readFile(files[iFile]);
			}
        } 
        
    }
    
    var readFile = function(file) {
        if (file.size == 0) {
            alert("File: '" + file.name + "' is empty!");
        } else if( (/pdf/i).test(file.type) ) {  

            $('#uploadWait').css('display', 'block');

            pdfFile = file;      
            var reader = new FileReader();
            
			reader.onload = function(e) {
                 pdfFile = file;
                
                 $('#caption').html(header.replace(/$.*/, '&nbsp;-&nbsp;\'' + file.name + '\''));
                
                 window.setTimeout(function() {
 
                    $('#uploadWait').css('display', 'none');

                 }, 1000);

                 convert(reader.result);
                
			};
            
            reader.onprogress = function(data) {
                
                if (data.lengthComputable) {                                            
                    var progress = parseInt( ((data.loaded / data.total) * 100), 10 );
                    document.getElementById("uploadProgress").className = "c100 p" + 
                    progress + 
                    " big blue";
                    $('#percentage').html(progress + "%");

                }
            }

            reader.readAsArrayBuffer(file);
          
        } else {
            alert(file.type + " - is not supported");
        }
    
     }

});