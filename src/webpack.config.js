var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var local = require('./local');
require('babel-polyfill');
var path = require('path');
var pathToMapboxGL = path.resolve(__dirname, '../assets/assets/js/mapbox-gl/mapbox-gl-0-32-1.js');
var pathToMapboxGLDraw = path.resolve(__dirname, '../assets/assets/js/mapbox-gl/mapbox-gl-draw.js');
var pathToPica = path.resolve(__dirname, '../node_modules/pica/dist/pica.min.js');
var pathToMediumEditor = path.resolve(__dirname, '../node_modules/medium-editor/dist/js/medium-editor.js');


module.exports = {
  devtool: 'eval',
  entry: {
    login: "./src/client/login",
    approvedialog: "./src/client/approvedialog",
    adminuserinvite: "./src/client/adminuserinvite",
    groups: "./src/client/groups",
    groupinfo: "./src/client/groupinfo",
    groupadmin: "./src/client/groupadmin",
    creategroup: "./src/client/creategroup",
    usergroups: "./src/client/usergroups",
    maps: "./src/client/maps",
    layers: "./src/client/layers",
    layerinfo: "./src/client/layerinfo",
    layermap: "./src/client/layermap",
    layeradmin: "./src/client/layeradmin",
    addphotopoint: "./src/client/addphotopoint",
    createlayer: "./src/client/createlayer",
    createremotelayer: "./src/client/createremotelayer",
    featureinfo: "./src/client/featureinfo",
    stories: "./src/client/stories",
    userstory: "./src/client/userstory",
    hubstory: "./src/client/hubstory",
    edithubstory: "./src/client/edithubstory",
    edituserstory: "./src/client/edituserstory",
    createhubstory: "./src/client/createhubstory",
    createuserstory: "./src/client/createuserstory",
    hubs: "./src/client/hubs",
    hubinfo: "./src/client/hubinfo",
    hubbuilder: "./src/client/hubbuilder",
    hubstories: "./src/client/hubstories",
    hubresources: "./src/client/hubresources",
    userhubs: "./src/client/userhubs",
    home: "./src/client/home",
    homepro: "./src/client/homepro",
    search: "./src/client/search",
    error: "./src/client/error",
    map: "./src/client/map",
    mapedit: "./src/client/mapedit",
    usermaps: "./src/client/usermaps",
    userstories: "./src/client/userstories",
    embedmap: "./src/client/embedmap",
    usermap: "./src/client/usermap",
    staticmap: "./src/client/staticmap",
    about: "./src/client/about",
    terms: "./src/client/terms",
    privacy: "./src/client/privacy",
    pageedit: "./src/client/pageedit",
    searchindexadmin: "./src/client/searchindexadmin",
    services: "./src/client/services",
    journalists: "./src/client/journalists",
    explore: "./src/client/explore",
    usersettings: "./src/client/usersettings",
    passwordreset: "./src/client/passwordreset",
    signup: "./src/client/signup",
    pendingconfirmation: "./src/client/pendingconfirmation",
    emailconfirmation: "./src/client/emailconfirmation",
    vendor: ["jquery", "slug", "react", "react-dom", "materialize-css", "reflux", "reflux-state-mixin", "debug", "react-notification", "superagent", "bluebird", "classnames", "lodash.isequal", "@turf/bbox", "@turf/meta", "superagent-jsonp", "terraformer", "intl", "moment-timezone"],
    locales: ["./src/services/locales"],
    mapboxgl: ["./assets/assets/js/mapbox-gl/mapbox-gl-0-32-1.js"]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },

  output: {
    path: local.publicFilePath,
    publicPath: '/public/',
    filename: "[name].js"
  },

  node: {
    fs: "empty",
    i18n: 'empty',
    net: "empty",
    tls: "empty"
  },

  module: {
    rules: [
      {
        test: /\.(glsl|vert|frag)([\?]?.*)$/,
        use: [{loader: 'raw-loader'}]
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        include: [/i18n\.js/, /locales/, /views/, /components/, /stores/, /actions/, /services/, /client/, /medium-editor/, /react-data-grid/, /react-disqus-thread/, /reflux-state-mixin/, /react-colorpickr/],       
        options: {
          presets: [
            "es2015",
            "react",
            "stage-0"
          ],
          plugins: ['transform-flow-strip-types']         
        }  
      },
      {
        test: /\.(scss|css)$/, 
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
            "css-loader",
            "resolve-url-loader",
            "sass-loader"
          ]
        })
      },
      {
        test: /\.(woff|svg|ttf|eot|gif)([\?]?.*)$/, 
        use: [{loader: "file-loader?name=[name].[ext]"}]
      }
    ],
    noParse: [
      pathToPica,
      pathToMapboxGL,
      pathToMapboxGLDraw,
      pathToMediumEditor,
      '/node_modules\/json-schema\/lib\/validate\.js/' //https://github.com/request/request/issues/1920
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
          $: "jquery",
       jQuery: "jquery",
       "window.jQuery": "jquery",
       Materialize: "materialize-css",
       "window.Materialize": "materialize-css"
    }),
    new webpack.optimize.CommonsChunkPlugin({
           names: ["locales", "vendor"],
                       minChunks: Infinity
   }),   
   new webpack.IgnorePlugin(/^(i18n|winston|winston-loggly|clientconfig)$/),
   new webpack.DefinePlugin({
    'process.env': {
        APP_ENV: JSON.stringify('browser'),
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }
  }),
  new webpack.BannerPlugin({banner: `MapHubs (https://github.com/maphubs)`, raw: false, entryOnly: true}),
  new ExtractTextPlugin({filename: "[name].css"})
  ],

  externals: {
    'unicode/category/So': '{}'
}
};
