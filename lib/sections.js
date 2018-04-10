module.exports = Sections

function Sections (targetSection) {
  const sections = document.querySelectorAll('section[name]')

  setTimeout(changeSection.bind(null, targetSection))
  return changeSection

  function changeSection (target) {
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getAttribute('name') === target) {
        sections[i].classList.add('current')
      } else {
        sections[i].classList.remove('current')
      }
      // sections[i].style.display = (
      //   sections[i].getAttribute('name') === target
      // ) ? null : 'none'
    }
  }
}