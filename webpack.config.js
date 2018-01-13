"use strict";

const path = require("path");

module.exports = {
    devtool: "source-map",
    entry: {
        QueryBuilder: path.join(__dirname, "src/server/QueryBuilder.js"),
        GrapeQLCoach: path.join(__dirname, "src/parser/GrapeQLCoach.js")
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
            }
        ]
    }
};
