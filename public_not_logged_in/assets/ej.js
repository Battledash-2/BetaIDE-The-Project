const viewJson = function() {
	let jv = document.querySelector('#json-view');
	let bd = document.querySelector('#body');

	if(jv.style.display == "block") {
		jv.style.display = "none";
		bd.style.display = "block";
	} else {
		jv.style.display = "block";
		bd.style.display = "none";
	}

	try {
		let json = JSON.stringify(files);

		document.querySelector('#jView').innerText = json;
		document.querySelector('#jc-btw').value = 'https://betaide.repl.co/p/cli?data={"files":'+encodeURIComponent(json)+'}';
		hljs.highlightAll();
	} catch(e) {
		console.log('There was an error while trying to update JSON view. Log: ', e);
	}
}
const copyJson = function() {
	let jv = document.querySelector('#jView');
	let nv = document.createElement('textarea');

	nv.value = jv.innerText;
	nv.style.display = "none";
	
	document.body.appendChild(nv);
	nv.select();

	document.execCommand('copy');

	nv.remove();

	copied();
}
function copied() {
	let c = document.createElement('div');
	c.classList.add('ac-al');

	c.innerHTML = '<h1 class="ac-al-h1">Copied Text</h1>';

	document.body.appendChild(c);
	setTimeout(()=>c.remove(), 1000);
}