export default function routes(app, addon) {
    // Redirect root path to /atlassian-connect.json,
    // which will be served by atlassian-connect-express.
    app.get('/', (req, res) => {
        res.redirect('/atlassian-connect.json');
    });

    // This is an example route used by "generalPages" module (see atlassian-connect.json).
    // Verify that the incoming request is authenticated with Atlassian Connect.
    app.get('/hashtags', addon.authenticate(), (req, res) => {

        // Rendering a template is easy; the render method takes two params: the name of the component or template file, and its props.
        // Handlebars and jsx are both supported, but please note that jsx changes require `npm run watch-jsx` in order to be picked up by the server.
        res.render(
          'hello-world.hbs', // change this to 'hello-world.jsx' to use the Atlaskit & React version
          {
            title: 'Atlassian Connect'
            //, issueId: req.query['issueId']
            //, browserOnly: true // you can set this to disable server-side rendering for react views
          }
        );
    });

    app.post('/page_updated', addon.authenticate(), (req, res) => {
      
      console.dir(addon.config);

      var confluence = require("./lib/confluence")(addon.httpClient(req));
      var axios = require('axios');

      confluence.getContent(req.body.page.id).then((content) => {
        console.log(content);
        var xhtmlContent = content.body.value;
        var hashtags = xhtmlContent.match(/#[\w-]+/g)
        hashtags.forEach(element => {
          console.log("Hastag found: " + element);
          
          axios({
            method: 'get',
            header: [ 'Accept: application/json', 'Content-Type: application/json' ],
            url: `https://lummerland-dev.atlassian.net/wiki/rest/api/content/${req.body.page.id}/label`
          }).then(response => {
            console.log(response)
          }).catch(error => {
            console.log(error)
          })
          
          axios({
            method: 'post',
            header: [ 'Accept: application/json', 'Content-Type: application/json' ],
            url: `${addon.config.baseUrl.href}wiki/rest/api/content/${req.body.page.id}/label`,
            data: {
              "prefix": "global",
              "name": element.substring(1)
            }
          }).then(response => {
            console.log(response)
          }).catch(error => {
            console.log(error)
          })
        });
      })

    })
}
