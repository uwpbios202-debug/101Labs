const labs = [
  { title:"Metacognition", folder:"bios101-learning", visible:true },
  { title:"Scientific Process", folder:"01_Science_of_Biology", visible:true },
  ...
];

fetch('/101Labs/shared/bios-nav.html')
  .then(r => r.text())
  .then(html => {
    document.body.insertAdjacentHTML('afterbegin', html);
    initBiosNav();
  });

function initBiosNav() {
  const menus = document.getElementById("biosMenus");
  const path = location.pathname;

  labs.forEach(lab => {
    const m = document.createElement("div");
    m.className = "bios-menu";

    const b = document.createElement("button");
    b.className = "bios-trigger";
    b.textContent = lab.title;
    if (path.includes(lab.folder)) b.classList.add("active");

    const d = document.createElement("div");
    d.className = "bios-dropdown";
    d.innerHTML = `
      <a href="/101Labs/${lab.folder}/index.html">Overview</a>
      <a href="/101Labs/${lab.folder}/prelab/prelab.html">Pre-Lab</a>
      <a href="/101Labs/${lab.folder}/during_lab/in-lab.html">In-Lab</a>
      <a href="/101Labs/${lab.folder}/postlab/postlab.html">Post-Lab</a>
      <a href="/101Labs/${lab.folder}/advanced/optional.html">Optional</a>
    `;

    m.append(b, d);
    menus.appendChild(m);
  });

  document.querySelector(".bios-toggle")
    .onclick = () => menus.classList.toggle("open");
}
