const toExtract = (t) => {
	const a = {}
	t.split(`\n`)
		.map((i) => {
			const b = i.match(/\[第 ([0-9]{0,3}) 课\]/)
			if (!b) return
			b[1] = Number.parseInt(b[1])
			const c = i.match(/<span class="jp">(.*?(?=<\/span>))/),
				e = i.match(/<span class="ssdsd">(.*?(?=<\/span>))/),
				m = i.match(/<hr>(.*?(?=<hr>))/)
			i = {
				n: c ? c[1] : "",
				e: e
					? e[1]
							.replace(/<ruby>/g, "[")
							.replace(/<\/ruby>/g, "]")
							.replace(/<[\/]?rb>/g, "")
							.replace(/<rt>/, "[")
							.replace(/<\/rt>/, "]")
					: "",
				m: m ? m[1].trim() : "",
			}
			b[1] in a ? a[b[1]].push(i) : (a[b[1]] = [i])
		})
	return a
}
const l = []
let show = (localStorage.getItem("show") || "").split(",")
const c = Object.entries(JSON.parse(cards))
	.map((i) => {
		l.push(`<a href="#${i[0]}">Lesson ${i[0]}</a>`)
		return `
		<h2 id="${i[0]}">Lesson ${i[0]}</h2>
		${i[1]
			.map((c) =>  `<p>${c.n}<span style="opacity: ${show.indexOf(c.n) === -1 ? 0 : 1}">${c.e}: ${c.m}</span></p>`)
			.join("")}
	`
	})
	.join("")
	document.querySelector("#main").innerHTML = `${l}<div id="content">${c}</div>`
const change = (s, el) => {
	if (!el) return
	const key = el.innerHTML.match(/^.*?(?=<span)/)
	if (!key) return
	s === "0" ? (show = show.filter(i => i !== key[0])) : show.push(key[0])
	localStorage.setItem("show", show.join(","))
}
document.querySelector("#content").onclick = (e) => {
	if (e.target.nodeName === "P") {
		e.target.innerHTML = e.target.innerHTML.replace(/opacity: ([0-9])/, (r1, r2) =>  {
			const n = r2 === "0" ? "1" : "0"
			change(n, e.target)
			return `opacity: ${n}`
		})
	}
	if (e.target.nodeName === "SPAN") { 
		e.target.style.opacity = e.target.style.opacity === "0" ? "1" : "0"
		change( e.target.style.opacity, e.target.parentNode)
	}
}