export function createFakeElement(value: string) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl'
  const fakeElement = document.createElement('textarea')
  // Prevent zooming on iOS
  fakeElement.style.fontSize = '12pt'
  // Reset box model
  fakeElement.style.border = '0'
  fakeElement.style.padding = '0'
  fakeElement.style.margin = '0'
  // Move element out of screen horizontally
  fakeElement.style.position = 'absolute'
  fakeElement.style[isRTL ? 'right' : 'left'] = '-9999px'
  // Move element to the same position vertically
  const yPosition = window.pageYOffset || document.documentElement.scrollTop
  fakeElement.style.top = `${yPosition}px`

  fakeElement.setAttribute('readonly', '')
  fakeElement.value = value

  return fakeElement
}

export function command(type: string) {
  try {
    return document.execCommand(type)
  }
  catch (err) {
    return false
  }
}

function select(element) {
  let selectedText

  if (element.nodeName === 'SELECT') {
    element.focus()

    selectedText = element.value
  }
  else if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
    const isReadOnly = element.hasAttribute('readonly')

    if (!isReadOnly)
      element.setAttribute('readonly', '')

    element.select()
    element.setSelectionRange(0, element.value.length)

    if (!isReadOnly)
      element.removeAttribute('readonly')

    selectedText = element.value
  }
  else {
    if (element.hasAttribute('contenteditable'))
      element.focus()

    const selection = window.getSelection()
    const range = document.createRange()

    range.selectNodeContents(element)
    selection.removeAllRanges()
    selection.addRange(range)

    selectedText = selection.toString()
  }

  return selectedText
}

module.exports = select

/**
 * Create fake copy action wrapper using a fake element.
 * @param {string} target
 * @param {object} options
 * @return {string}
 */
function fakeCopyAction(value, options) {
  const fakeElement = createFakeElement(value)
  options.container.appendChild(fakeElement)
  const selectedText = select(fakeElement)
  command('copy')
  fakeElement.remove()

  return selectedText
}

/**
 * Copy action wrapper.
 * @param {string | HTMLElement} target
 * @param {object} options
 * @return {string}
 */
function ClipboardActionCopy(target, options = { container: document.body }) {
  let selectedText = ''
  if (typeof target === 'string') {
    selectedText = fakeCopyAction(target, options)
  }
  else if (
    target instanceof HTMLInputElement
    && !['text', 'search', 'url', 'tel', 'password'].includes(target?.type)
  ) {
    // If input type doesn't support `setSelectionRange`. Simulate it. https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setSelectionRange
    selectedText = fakeCopyAction(target.value, options)
  }
  else {
    selectedText = select(target)
    command('copy')
  }
  return selectedText
}

export default ClipboardActionCopy

// 选中指定元素中的指定文本内容，文本保持选中状态
function selectText(element: HTMLElement) {
  const selection = window.getSelection()
  const range = document.createRange()

  range.selectNodeContents(element)
  selection.removeAllRanges()
  selection.addRange(range)
}
