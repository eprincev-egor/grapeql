"use strict";

const path = require("path");

module.exports = {
    devtool: "source-map",
    entry: {
        Filter: "./src/filter/Filter",
        Parser: "./src/parser/GrapeQLCoach"
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].js"
    },

    module: {
        rules: [
            {
                exclude: /(node_modules|bower_components|videojs|underscore)/,
                test: /\.js$/,
                loader: "babel-loader",
                query: {
                    presets: ["es2015"]
                }
            },
            {
                test: /\.json$/,
                loader: "json-loader"
            }
        ]
    }
};
