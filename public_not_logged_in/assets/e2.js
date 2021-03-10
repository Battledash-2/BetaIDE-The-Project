function cf() {
	let fname = prompt('What would you like to name the file?', 'New File');
	if(fname.trim() == "") {
		return cf();
	}
	if(files[fname]) {
		let c = confirm('A file with that name already exists. Would you like to continue?');
		if(!c) return;
	}
	files[fname] = "";
	uda();
}
function mimeFromName(fname) {
	let mimeTypes = {
		"html": "text/html",
		"txt": "text/plain",
		"css": "text/css",
		"js": "application/javascript",
		"svg": "image/svg+xml",
		"png": "image/png",
		"jpg": "image/jpeg",
		"jpeg": "image/jpeg",
		"ide": "application/json",
		"json": "application/json",
		"mjs": "application/javascript",
		"jsm": "application/javascript"
	};
	for(var ext in mimeTypes) {
		if(fname.endsWith('.'+ext)) {
			return mimeTypes[ext];
		}
	}

	return 'text/plain';
}
var files = JSON.parse(document.querySelector('#fhold').innerText);

//document.querySelector('#fhold').remove();

// we need to display the files
// the files object is a copy of the files inside of the db
function addFIn(sel, obj, oname) {
	sel = document.querySelector(sel) || sel;
	for(var n in obj) {
		if(typeof obj[n] == 'string') {
			// this is a file
			let container = document.createElement('div');
			container.classList.add('file');
			container.style.width = '20vw';
			container.style.height = '50px';
			container.style.background = '#3d3c3c';
			container.style.color = '#fff';
			container.style.display = 'grid';
			container.style.alignContent = 'center';
			container.style.textAlign = 'center';
			container.style.cursor = 'pointer';
			container.setAttribute('fname', n);

			container.innerText = n+'\n'+mimeFromName(n)+' File';
			if(n == 'index.html') {
				container.style.background = '#616161';
				container.setAttribute('selected_file', ''); // it actually worked :O
			}

			let delb = document.createElement('button');
			delb.style.width = '30px';
			delb.style.height = '50px';
			delb.style.color = 'red';
			delb.innerText = 'X';
			delb.style.fontFamily = 'monospace';
			delb.style.fontSize = '40px';
			delb.style.position = 'relative';
			delb.style.left = 'calc(20vw - 30px)';
			delb.style.marginTop = '-38px';
			delb.style.cursor = 'pointer';

			delb.onclick = ()=>{
				for(var fn in files) {
					if(typeof files[fn] == 'string') {
						if(n == fn) {
							container.remove();
							document.querySelector('#text-edit').value = '';
							highlight();
							currentFile = 'index.html';
							setTimeout(()=>{
							delete files[fn]; currentFile = 'index.html';
							document.querySelector("#text-edit").value = files['index.html'];
							highlight('#editor', 'html');
							}, 50);
						}
					}
				}
			}

			sel.appendChild(container);
			container.appendChild(delb);
		}
	}
}
addFIn('#files', files);