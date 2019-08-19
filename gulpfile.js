// gulpfile.js
"use strict";

const path = require( 'path' );

const browsersync = require( "browser-sync" ).create();

const autoprefixer = require( "gulp-autoprefixer" );

const cleanCSS = require( "gulp-clean-css" );
const del = require( "del" );
const gulp = require( "gulp" );
const header = require( "gulp-header" );
const merge = require( "merge-stream" );
const plumber = require( "gulp-plumber" );
const rename = require( "gulp-rename" );
const sass = require( "gulp-sass" );
const uglify = require( "gulp-uglify" );

// Load package.json for banner
const pkg = require( './package.json' );


const banner = [ '/*!\n',
    ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2013-' + ( new Date() ).getFullYear(), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
    ' */\n',
    '\n'
].join( '' );


const {
    series,
    parallel
} = require( 'gulp' );
const {
    exec
} = require( 'child_process' );

const pug = require( 'gulp-pug' );

// client souce
var APP_DIR = path.join( __dirname, 'app' );
var CLIENT_DIR = path.join( APP_DIR, 'client' );

var CLIENT_SRC = path.join( CLIENT_DIR, 'pug_src' );
var PUG_INC = path.join( CLIENT_SRC, 'pug_inc' );
var SCSS_SRC = path.join( CLIENT_SRC, 'scss' );



// asset folder
var PUBLIC_PATH = path.join( __dirname, 'docs' );
var PUBLIC_CSS = path.join( PUBLIC_PATH, 'css' );
var PUBLIC_JS = path.join( PUBLIC_PATH, 'js' );
var PUBLIC_IMG = path.join( PUBLIC_PATH, 'img' );


// client source directory
var PROJ_HOME = __dirname;
var APP_DIR = path.join( PROJ_HOME, 'app' );
var CLIENT_DIR = path.join( APP_DIR, 'client' );
var CLIENT_SRC = path.join( CLIENT_DIR, 'src' )
var CLIENT_SCSS = path.join( CLIENT_SRC, 'scss' );
var CLIENT_JS = path.join( CLIENT_SRC, 'js' );
var CLIENT_IMG = path.join( CLIENT_SRC, 'img' );
var CLIENT_MP4 = path.join( CLIENT_SRC, 'mp4' );

var CLIENT_PUG = CLIENT_SRC;
var CLIENT_PUG_INC = path.join( CLIENT_SRC, 'pug_inc' );
var INDEX_PUG = path.join( CLIENT_SRC, 'index.pug' );

// public directory
var PUBLIC_DIR = path.join( __dirname, 'docs' );
var PUBLIC_CSS = path.join( PUBLIC_DIR, 'css' );
var PUBLIC_JS = path.join( PUBLIC_DIR, 'js' );
var PUBLIC_IMG = path.join( PUBLIC_DIR, 'img' );
var PUBLIC_MP4 = path.join( PUBLIC_DIR, 'mp4' );

// build config
var PUG_PATHS = [ CLIENT_SRC, PUG_INC ];
var SCSS_PATHs = [ SCSS_SRC ];
var PUG_FILEMASK = PUG_PATHS.map( p => path.join( p, '*.pug' ) );
var SCSS_MAIN = 'coming-soon.scss';
var JS_MAIN = 'coming-soon.js';

// i think it is easier if i implement it using fabric
async function clean_public_dir() {
    return exec( `rm -rf ${PUBLIC_PATH}` );
}

async function mkdir_public_dir() {
    return exec( `mkdir -p ${PUBLIC_PATH}` );
}

async function mkdir( dir_path ) {
    return exec( 'mkdir -p ' + dir_path );
}

async function copy_dir( src_path, dst_path ) {
    return exec( `cp ${src_path} ${dst_path}` );
}

async function copy_img() {
    return copy_dir( CLIENT_IMG + "/*", PUBLIC_IMG + "/" )
}

async function copy_mp4() {
    return copy_dir( CLIENT_MP4 + '/*', PUBLIC_MP4 + '/' )
}

async function re_privision_public_dir() {
    await clean_public_dir();
    await mkdir_public_dir();
    await mkdir( PUBLIC_PATH );
    await mkdir( PUBLIC_IMG );
    await mkdir( PUBLIC_CSS );
    await mkdir( PUBLIC_JS );
    await mkdir( PUBLIC_MP4 );
    await copy_img();
}

async function buildHTML() {
    return gulp.src( INDEX_PUG )
        .pipe( pug( {} ) )
        .pipe( gulp.dest( PUBLIC_PATH ) );
    // console.log( "helloworld" );
};

async function helloworld() {
    console.log( "helloworld" );
}

async function sass_compile() {
    return gulp.src( path.join( SCSS_SRC, 'main.scss' ) )
        .pipe( sass().on( 'error', sass.logError ) )
        .pipe( gulp.dest( PUBLIC_CSS ) );
}

// CSS task
function css() {
    return gulp
        .src( path.join( CLIENT_SCSS, SCSS_MAIN ) )
        .pipe( plumber() )
        .pipe( sass( {
            outputStyle: "expanded",
            includePaths: "./node_modules",
        } ) )
        .on( "error", sass.logError )
        .pipe( autoprefixer( {
            browsers: [ 'last 2 versions' ],
            cascade: false
        } ) )
        .pipe( header( banner, {
            pkg: pkg
        } ) )
        .pipe( gulp.dest( PUBLIC_CSS ) )
        .pipe( rename( {
            suffix: ".min"
        } ) )
        .pipe( cleanCSS() )
        .pipe( gulp.dest( PUBLIC_CSS ) )
        .pipe( browsersync.stream() );
}

// JS task
function js() {
    return gulp
        .src( [ path.join( CLIENT_JS, JS_MAIN ) ] )
        .pipe( uglify() )
        .pipe( header( banner, {
            pkg: pkg
        } ) )
        .pipe( rename( {
            suffix: '.min'
        } ) )
        .pipe( gulp.dest( PUBLIC_JS ) )
        .pipe( browsersync.stream() );
}

function browserSyncReload( done ) {
    browsersync.reload();
    done();
}


function watchFiles() {
    gulp.watch( CLIENT_SCSS + '/*', css );
    gulp.watch( CLIENT_JS + '/*', js );
    gulp.watch( [ CLIENT_PUG + '/*', CLIENT_PUG_INC + '/*' ], gulp.series( compile_pug, browserSyncReload ) );
}

// BrowserSync
const browserSyncInit = function ( done ) {
    browsersync.init( {
        server: {
            baseDir: "./docs"
        },
        port: 3000
    } );
    done();
}

function compile_pug( done ) {
    console.log( INDEX_PUG );
    gulp.src( INDEX_PUG )
        .pipe( pug( {} ) )
        .pipe( gulp.dest( PUBLIC_PATH ) );
    done();
}

function copy_img_files( done ) {
    gulp.src( [ CLIENT_IMG + '/*' ] )
        .pipe( gulp.dest( PUBLIC_IMG ) );

    done();
}

var default_task = series(
    re_privision_public_dir,
    compile_pug, css, js, copy_img_files, copy_mp4
);



exports.default = default_task;
exports.sass = sass_compile;
exports.w = () => {
    gulp.watch( PUG_FILEMASK, default_task );
    gulp.watch( SCSS_PATHs, default_task );
}

const build = gulp.parallel( re_privision_public_dir, compile_pug, css, js, copy_img_files );
const watch = gulp.series( default_task, gulp.parallel( watchFiles, browserSyncInit ) );



exports.css = css;
exports.js = js;
// exports.clean = clean;
// exports.vendor = vendor;
exports.w = watch;
