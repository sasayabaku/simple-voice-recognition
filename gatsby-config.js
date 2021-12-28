require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`
});

module.exports = {
  siteMetadata: {
    title: "VoiceNote",
  },
  plugins: [
    "gatsby-plugin-sass"
  ],
};
