{
  name: 'template-html',
  output: `<!DOCTYPE html>
    <html>
      <body>
        <div>%div%</div>
        <table>
          <tbody>
            %tbody%
          </tbody>
        </table>
      </body>
    </html>`,
  properties: {
    div: {
      type: 'container',
      default: '(div) Place module here',
    },
    tbody: {
      type: 'container',
      default: '<tr><td>(tbody) Place module here</td></tr>',
    }
  }
}