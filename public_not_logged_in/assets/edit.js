const socket = io();
const project_name = document.querySelector('#cname').innerText;
const user_name = document.querySelector('#uname').innerText;
document.querySelector('#uname').remove();
document.querySelector('#cname').remove();
let currentFile = 'index.html';
let didd = false;
function main() {
	document.querySelector('#cf').innerText = currentFile;
	document.querySelector('#ltv').href = 'javascript:open("https://usercontent.' + location.hostname + '/p/view/' + user_name + '/' + project_name + '/")';
}
setInterval(main, 300);
let edits = false;
function glang(fname) {
	let langs = {
		"txt": "text",
		"html": "html",
		"css": "css",
		"js": "js",
		"svg": "html",
		"xml": "html",
		"json": "js",
		"ide": "js",
		"mjs": "js",
		"jsm": "js"
	}
	let res = 'text';
	for(var i in langs) {
		if(fname.endsWith('.'+i)) {
			res = langs[i]
		}
	}
	return res;
}
function scroll() {
	const edt = document.querySelector('#editor');
	const tedt = document.querySelector('#text-edit');
	edt.scrollTop = tedt.scrollTop;
	edt.scrollLeft = tedt.scrollLeft;
}
function highlight(m='html') {
	files[currentFile] = document.querySelector('#text-edit').value;
	let lang = glang(currentFile);
	if(lang == 'text') {
		const edt = document.querySelector('#editor');
		const tedt = document.querySelector('#text-edit');
		
		edt.innerText = tedt.value;
		scroll();
		return true;
	} else {
		m = lang;
	}
	const edt = document.querySelector('#editor');
	const tedt = document.querySelector('#text-edit');
	edt.innerHTML = tedt.value.replace(/&/gmi, '&amp;').replace(/</gmi, '&lt;').replace(/>/gmi, '&gt;').replace(/\n/gmi, '<br><span></span>');
	dhighlight('editor', m);
	scroll();
}
setTimeout(highlight, 1);
document.querySelector('#text-edit').onscroll = scroll;
document.querySelector('#text-edit').oninput = highlight;
//setInterval(highlight, 400);
document.querySelector('#text-edit').value = files['index.html'];
function insertText(elm, text) {
	elm = document.querySelector(elm) || elm;
	let ss = elm.selectionStart;

	elm.value = elm.value.substring(0,elm.selectionStart) + text + elm.value.substring(elm.selectionStart);
	elm.selectionEnd = ss+text.length;
}
let r = false;
document.querySelector('#text-edit').onkeydown = (e)=>{
	edits=true;
	if(e.code.toLowerCase() == 'tab') {
		e.preventDefault();

		insertText('#text-edit', '\t');
		highlight();
	} else if(e.code.toLowerCase() == 'enter') {
		e.preventDefault();
		let line = e.target.value.substring(0, e.target.selectionStart)[e.target.value.substring(0, e.target.selectionStart).length-1];
		let tabs = 0;
		try {
			tabs = line.split('\t').length+1;
		} catch(e) {
			0;
		}
		function r(str, tim=1) {
			let res = '';
			for(var i = 0; i<tim; i++) {
				res += str;
			}
			return res;
		}
		if(r) {insertText('#text-edit', '\n'+r('\t', tabs-1));r=false;return highlight();}
		r = true;
		insertText('#text-edit', '\n'+r('\t', tabs))
		highlight();
	}
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
				document.querySelector('#text-edit').value = files[currentFile];
				highlight();
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