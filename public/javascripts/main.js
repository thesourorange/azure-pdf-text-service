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
function showTab(e, tab, button) {
    var iTab, tabcontent, tabbuttons, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (iTab = 0; iTab < tabcontent.length; iTab++) {
        tabcontent[iTab].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (iTab = 0; iTab < tablinks.length; iTab++) {
        tablinks[iTab].className = tablinks[iTab].className.replace(" active", "");
        tablinks[iTab].style.textDecoration = "none";
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tab).style.display = "block";
    document.getElementById(button).style.textDecoration = "underline";
 
    evt.currentTarget.className += " active";
}

function getText(domElement) {
    var root = domElement;
    var text = [];
  
    function traverseTree(root) {
      Array.prototype.forEach.call(root.childNodes, function(child) {
        if (child.nodeType === 3) {
          var str = child.nodeValue.trim().replace(/[^\w\s\n]/gi, '');
          if (str.length > 0) {
            text.push(str);
          }
        } else {
          traverseTree(child);
        }
      });
    }
    traverseTree(root);

    return text.join(' ');

}

function convert(pdfContent) {
 
    console.log('started conversion');

    $('#waitImage').css('display', 'block');

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


            window.setTimeout(function() {
                var progress = parseInt( ((iPage / total - 1) * 100), 10);   

                document.getElementById("uploadProgress").className = "c100 p" + 
                progress + " big green";

                $('#percentage').html(progress + "%");
                
            }, 100);

           if (++complete == total){ 
                console.log("Finished rendering. Extracting text...");
            
                window.setTimeout(function(){
                    var progress = parseInt( ((iPage / total - 1) * 100), 10);   

                    document.getElementById("uploadProgress").className = "c100 p" + 
                    progress + " big green";
        
                    $('#percentage').html(progress + "%");
        
                    var layers = [];
                    var nodes = document.querySelectorAll(".textLayer > div");
                    for (var j = 0; j < nodes.length; j++) {
                        layers.push(nodes[j].textContent + "\n");
                    }
                    
                    $('#structureFrame').css('display', 'inline-block');
                    $('#tab').css('visibility', 'visible');
                    $('#actions').css('visibility', 'visible');
                    $('#uploadWait').css('display', 'none');
                    $('#tab1').css('text-decoration', 'underline');
                    $('#text').text(getText($('#content')[0]));
                    $('#waitImage').css('display', 'none');
 
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
    var el = $('#content')[0];
    var range = document.createRange();
 
    range.selectNodeContents(el)
    var sel = window.getSelection();
 
    sel.removeAllRanges();
    
    sel.addRange(range);

    document.execCommand('copy');
    
    alert('Contents copied to Clipboard');

    return false;

 });

 $('#saveBtn').on('click', function(e) {
     try {
    var saveLink = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
    var canUseSaveLink = "download" in saveLink;
    var getURL = function() {
        return view.URL || view.webkitURL || view;
    }

    var click = function(node) {
        var event = new MouseEvent("click");
        node.dispatchEvent(event);
    }

    var properties = {type: 'text/plain'}; 
    var fileName = 'pdf.txt';

    file = new File([$('#text').text()], fileName, properties);

    var fileURL = URL.createObjectURL(file);

    saveLink.href = fileURL;
    saveLink.download = fileName;
    
    click(saveLink);

    } catch (e) {
        alert(e);
    }

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
            $('#tab').css('visibility', 'hidden');
            $('#structureFrame').css('display', 'none');
            $('#contentFrame').css('display', 'none');
            $('#textFrame').css('display', 'none');
            $('#actions').css('visibility', 'hidden');

            var tablinks = document.getElementsByClassName("tablinks");
            for (iTab = 0; iTab < tablinks.length; iTab++) {
                tablinks[iTab].style.textDecoration = "none";
            }

            pdfFile = file;      
            var reader = new FileReader();
            
			reader.onload = function(e) {
                 pdfFile = file;
                
                 $('#caption').html(header.replace(/$.*/, '&nbsp;-&nbsp;\'' + file.name + '\''));
                
                 var progress = "100";
                 document.getElementById("uploadProgress").className = "c100 p" + 
                 progress + 
                 " big blue";
                 $('#percentage').html(progress + "%");

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