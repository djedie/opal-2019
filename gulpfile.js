/**
 * Variables
 */
var name_theme  = 'opal';

/**
 * include plug-ins
 */
var gulp         = require('gulp');
var changed      = require('gulp-changed');
var imagemin     = require('gulp-imagemin');
var concat       = require('gulp-concat-multi');
var stripDebug   = require('gulp-strip-debug');
var uglify       = require('gulp-uglify');
var sass         = require('gulp-sass');
var notify       = require('gulp-notify');
var cleanCSS     = require('gulp-clean-css');
var sourcemaps   = require('gulp-sourcemaps');
var rename       = require('gulp-rename');
var watch        = require('gulp-watch');
var gutil        = require('gulp-util');
var del          = require('del');
var inject       = require('gulp-inject');
var autoprefixer = require('gulp-autoprefixer');
var browserSync  = require('browser-sync').create();

/**
 * Path
 */
var domaine     = name_theme+'.test';
var src_theme   = './src/';
var src_sass    = './src/sass/';
var dist_theme  = './dist/';
var src_js      = src_theme + 'js/';
var src_js_libs = src_js + 'libs/';
var path = {
    src : {
        img     : src_theme + 'img/**/*',
        php     : src_theme + '**/*.php',
        html    : src_theme + '**/*.html',
        scripts : [
            {
                path  : src_js,
                files : {
                    'script.js' : [
                        src_js + 'jquery/*.js',
                        src_js_libs + '**/*.js',
                        src_js + 'script.js',
                    ]
                }
            },
        ],
        scss   : src_sass + '**/*.scss',
        divers : [
            src_theme + 'fonts/**/*',
            src_theme + 'videos/**/*',
            src_theme + 'favicon*',
            src_theme + 'android-chrome-*',
            src_theme + 'apple-touch-icon*',
            src_theme + 'browserconfig.*',
            src_theme + 'manifest*',
            src_theme + 'site.webmanifest',
            src_theme + 'humans.txt',
            src_theme + 'mstile-*',
            src_theme + 'safari-pinned-tab*',
            src_theme + 'fonts/**/*',
            src_theme + '**/.gitkeep',
        ],
    },
    dist : {
        img     : dist_theme + 'img/',
        php     : dist_theme,
        html    : dist_theme,
        scripts : [
            dist_theme + 'js/',
        ],
        scss    : dist_theme,
        divers  : dist_theme,
    }
}

function generationPage( src, dist ){

    gulp.src( src )

        // @todo : ajouter ici vos injection JS
        .pipe( injectCustom( 0, 'html' ) )
        .pipe( injectCustom( 0, 'php' ) )

        .pipe( changed( dist ) )
        .pipe( gulp.dest( dist ) )
        .on( 'end', browserSync.reload );
}

/**
 * TASKS
 */

// Browser Sync
gulp.task('browser-sync', function() {
    browserSync.init({
        proxy: domaine,
        host: domaine,
        open: 'external'
    });
});

// HTML
gulp.task('htmlpage', function() {
    generationPage( path.src.html, path.dist.html )
});

// PHP
gulp.task('phppage', function() {
    generationPage( path.src.php, path.dist.php )
});

// minify new images
gulp.task('imagemin', function() {
  gulp.src( path.src.img )
    .pipe(changed( path.dist.img ))
     .pipe(imagemin({
          progressive: true,
          optimizationLevel: 7
      }))
    .pipe(gulp.dest( path.dist.img ))
    .on( 'end', browserSync.reload );
});

// JS concat, strip debugging and minify
gulp.task('scripts', function() {
    for( var i in path.src.scripts ){
        for( var j in path.src.scripts[ i ][ 'files' ] ){
            if( gutil.env.type === 'production' ){
                concat( path.src.scripts[ i ][ 'files' ] )
                    .pipe( stripDebug() )
                    .pipe( uglify() )
                    .pipe( gulp.dest( path.dist.scripts[ i ] ) )
                    .on( 'end', browserSync.reload );
            } else {
                base = path.src.scripts[ i ][ 'path' ];
                gulp.src( path.src.scripts[ i ][ 'files' ][ j ], { base: path.src.scripts[ i ][ 'path' ] } )
                    .pipe( gulp.dest( path.dist.scripts[ i ] ) )
                    .on( 'end', browserSync.reload );
            }
        }
    }
});

gulp.task('styles', function() {
    if( gutil.env.type === 'production' ){
      var sassArgs = {outputStyle: 'compressed'}
    } else {
      var sassArgs = {outputStyle: 'nested'}
    }
    gulp.src(path.src.scss)
        .pipe(sass(sassArgs).on('error', notify.onError({
            message: "Error: <%= error.message %>",
            title: "Error running something"})))
        .pipe( autoprefixer({browsers: ['Firefox >= 48', 'IE >= 11', 'Chrome >= 50']}) )
        .pipe( sourcemaps.init() )
        .pipe( cleanCSS() )
        .pipe( sourcemaps.write('./') )
        .pipe( gulp.dest(path.dist.scss ) )
        .pipe( browserSync.stream() );
});

// Copier-coller
gulp.task( 'divers', function() {
    gulp.src( path.src.divers, { base: src_theme } )
        .pipe(changed( path.dist.divers ))
        .pipe( gulp.dest( path.dist.divers ) )
        .on( 'end', browserSync.reload );
});

// Clean du dist
gulp.task( 'clean_all', function() {
    return del( [ dist_theme + '**/*', '!' + dist_theme + '.htaccess' ] )
});
gulp.task( 'reset', [ 'clean_all' ], function(){
    gulp.start( 'default' );
});
gulp.task( 'clean', function() {
    return del( [ dist_theme + '**/*.php', dist_theme + '**/*.html', dist_theme + '**/*.js', dist_theme + '**/*.css', dist_theme + '**/*.css.map' ] );
});


// default gulp task
gulp.task('default', [ 'clean', 'imagemin' ], function() {

    gulp.start( 'styles' );
    gulp.start( 'htmlpage' );
    gulp.start( 'phppage' );
    gulp.start( 'scripts' );
    gulp.start( 'divers' );
    gulp.start( 'browser-sync' );

    // watch for SCSS changes
    watch( path.src.scss, function() {
        gulp.start( 'styles' );
    });

    // watch for HTML changes
    watch( path.src.html, function() {
        gulp.start( 'htmlpage' );
    });

    // watch for PHP changes
    watch( path.src.php, function() {
        gulp.start( 'phppage' );
    });

    // watch for scripts changes
    for( var i in path.src.scripts ){
        for( var j in path.src.scripts[ i ][ 'files' ] ){
            watch( path.src.scripts[ i ][ 'files' ][ j ], function() {
                gulp.start( 'scripts' );
            });
        }
    }

    // watch for images changes
    watch( path.src.img, function() {
        gulp.start( 'imagemin' );
    });

    // watch for divers
    watch( path.src.divers, function() {
        gulp.start( 'divers' );
    });

});


/**
 * Functions
 */
function injectCustom( index, type ){
    for( var j in path.src.scripts[ index ][ 'files' ] ){
        if( 'html' == type )
            return inject(
                gulp.src( ( gutil.env.type === 'production' ? path.src.scripts[ index ][ 'path' ] + j : path.src.scripts[ index ][ 'files' ][ j ] ), { read: false } ),
                {
                    starttag: ( path.src.scripts[ index ][ 'html_starttag' ] ) ? path.src.scripts[ index ][ 'html_starttag' ][ 0 ] : '<!-- ' + j + ':{{ext}} -->',
                    endtag: ( path.src.scripts[ index ][ 'html_starttag' ] ) ? path.src.scripts[ index ][ 'html_starttag' ][ 1 ] : '<!-- endinject -->',
                    transform: function( filepath ){
                        filepath = filepath.substring( filepath.lastIndexOf( name_theme ) + src_theme.length);
                        return inject.transform.apply( inject.transform, arguments );
                    }
                }
            );
        else
            return inject(
                gulp.src( ( gutil.env.type === 'production' ? path.src.scripts[ index ][ 'path' ] + j : path.src.scripts[ index ][ 'files' ][ j ] ), { read: false } ),
                {
                    starttag: '// inject:' + j + ':{{ext}}',
                    endtag: '// endinject',
                    transform: function( filepath ){
                        filepath = filepath.substring( filepath.lastIndexOf( name_theme ) + src_theme.length);
                        return inject.transform.apply( inject.transform, arguments );
                    }
                });
    }
}
