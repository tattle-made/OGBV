module.exports = {
  siteMetadata: {
    siteUrl: `https://uli.tattle.co.in`,
  },
  plugins: [
    "gatsby-plugin-styled-components",
    "gatsby-plugin-image",
    "gatsby-plugin-react-helmet",
    {
      resolve: "gatsby-plugin-mdx",
      options: {
        defaultLayouts: {
          default: require.resolve(
            "./src/components/molecules/ContentPageShell.jsx"
          ),
        },
      },
    },
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: "./src/images/",
      },
      __key: "images",
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "pages",
        path: "./src/pages/",
      },
      __key: "pages",
    },
    {
      resolve: `gatsby-plugin-s3`,
      options: {
        bucketName: "uli.tattle.co.in",
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Uli Website`,
        short_name: `uli`,
        start_url: `/`,
        display: `minimal-ui`,
        icon: `src/images/favicon-32x32.png`, // This path is relative to the root of the site.
      },
    },
  ],
};
