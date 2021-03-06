const postcss = require('postcss')
const path = require('path')
const fs = require('fs')

const plugin = require('./')

async function run (input, output, opts = { }) {
  let result = await postcss([plugin(opts)]).process(input, { from: undefined })
  expect(result.css).toEqual(output)
  expect(result.warnings()).toHaveLength(0)
}

// /* Write tests here

it('test remUnit', async () => {
  const input = fs.readFileSync(path.resolve('./test/input/test1.css'))
  const output = fs.readFileSync(path.resolve('./test/output/test1.css'))
  await run(input.toString(), output.toString(), { remUnit: 5 })
})

it('test mediaQuery', async () => {
  const input = fs.readFileSync(path.resolve('./test/input/test2.css'))
  const output = fs.readFileSync(path.resolve('./test/output/test2.css'))
  await run(input.toString(), output.toString(), { remUnit: 5, mediaQuery: true })
})

// */
