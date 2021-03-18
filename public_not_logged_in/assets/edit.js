const socket = io();
const project_name = document.querySelector('#cname').innerText;
const user_name = document.querySelector('#uname').innerText;
document.querySelector('#uname').remove();
document.querySelector('#cname').remove();
let currentFile = 'index.html';
let didd = false;
function main() {
	document.querySelector('#ltv').href = 'javascript:open("https://usercontent.' + location.hostname + '/p/view/' + user_name + '/' + project_name + '/")';
	document.querySelector('#cf').innerText = currentFile || 'No File Open';
	// #editor-area / resize the editor
	try {
		let ear = document.querySelector('#editor-area');
		cme.setSize(null, ear.getBoundingClientRect().height);
	} catch(e) {
		console.warn('Codemirror Not Loaded.');
	}
}
setInterval(main, 300);
let edits = false;
function glang(fname) {
	let langs = {
		"txt": "text",
		"html": "htmlmixed",
		"css": "css",
		"js": "javascript",
		"svg": "htmlmixed",
		"xml": "htmlmixed",
		"json": "javascript",
		"ide": "javascript",
		"mjs": "javascript",
		"jsm": "javascript"
	}
	let res = 'text';
	for(var i in langs) {
		if(fname.endsWith('.'+i)) {
			res = langs[i]
		}
	}
	return res;
}
function highlight(m='htmlmixed') {
	cme.setOption('mode', m)
}
//setInterval(highlight, 400);
function insertText(elm, text) {
	elm = document.querySelector(elm) || elm;
	let ss = elm.selectionStart;

	elm.value = elm.value.substring(0,elm.selectionStart) + text + elm.value.substring(elm.selectionStart);
	elm.selectionEnd = ss+text.length;
}
let r = false;
let cme = CodeMirror.fromTextArea(document.querySelector('#text-edit'), {
	lineNumbers: true,
	theme: "material",
	mode: "htmlmixed",
	value: files[currentFile] || '',
	indentWithTabs: true,
	indentUnit: 4
});
cme.setValue(files[currentFile] || '');
cme.on('change', ()=>{
	files[currentFile] = cme.getValue();
});
document.querySelector('#text-edit').onkeydown = (e)=>{
	edits=true;
}

onbeforeunload = ()=>{
	if(edits) {
		return 'changes';
	}
}
if(files == undefined) {files = {}}
function autoSave() {
	let string_f = JSON.stringify(files) || '{}';
	//console.log(string_f);
	//btoa(unescape(encodeURIComponent('😂')));
	//btoa(unescape(encodeURIComponent('😂')));
	string_f = string_f.replace(/    /gmi, '\\t');
	//console.log(string_f);
	socket.emit('save', {
		"project": project_name,
		"files": string_f
	});
	console.log('Saved');
	//console.log({
	//	"project": project_name,
	//	"files": string_f
	//});
	edits = false;
}
setInterval(autoSave, 300);
function uda() {
	document.querySelector("#files").innerHTML = '';
	addFIn('#files', files);
	// .file   [fname="*"]
	document.querySelectorAll('.file').forEach(file=>{
		let fname = file.getAttribute('fname');
		//#3d3c3c #616161

		if(fname in files) {
			file.onclick = ()=>{
				currentFile = fname;
				cme.setValue(files[currentFile]);
				highlight(glang(fname));
				document.querySelectorAll('#files *').forEach(f=>{
					if(f instanceof HTMLDivElement) {
						f.style.background = '#3d3c3c';
					}
				});
				file.style.background = '#616161';
			}
		} else {
			console.log('Unknown file '+fname, fname in files);
		}
	});
}
uda();