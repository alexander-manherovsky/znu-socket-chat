import gulp from 'gulp';
import dartSass from 'sass'
import gulpSass from 'gulp-sass'
import {deleteAsync} from 'del';
import browserSync from 'browser-sync';

const bSync = browserSync.create();
const sass = gulpSass(dartSass)

const src = {
    sass: 'sass/**/*.scss',
    css: 'public/css',
    html: 'public/*.html'
};

gulp.task('clean', () => {
    return deleteAsync(src.css + '/*.css');
});

gulp.task('sass', () => {

    return gulp.src('sass/main.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(src.css));
});

gulp.task('watch',  () => {

    bSync.init(null, {
        server: {
            baseDir: "./public",
        }
    });

    gulp.watch(src.sass, gulp.series('clean', 'sass'));
});

gulp.task('default', gulp.series('clean', 'sass', 'watch'));