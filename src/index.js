import {BehaviorSubject, combineLatest, fromEvent, of} from 'rxjs'
import {
    map,
    pairwise,
    switchMap,
    takeUntil,
    withLatestFrom,
    startWith,
    pluck,
    tap,
    skip,
    filter,
    flatMap
} from 'rxjs/operators'

const canvas = document.querySelector('canvas')
const range = document.getElementById('range')
const color = document.getElementById('color')
const clear = document.getElementById('clear')
const gum = document.getElementById('gum')
const line = document.getElementById('line')

const ctx = canvas.getContext('2d')
const rect = canvas.getBoundingClientRect()
const scale = window.devicePixelRatio

canvas.width = rect.width * scale
canvas.height = rect.height * scale
ctx.scale(scale, scale)

const mouseMove$ = fromEvent(canvas, 'mousemove')
const mouseDown$ = fromEvent(canvas, 'mousedown')
const mouseUp$ = fromEvent(canvas, 'mouseup')
const mouseOut$ = fromEvent(canvas, 'mouseout')

const mouseClick$ = fromEvent(line, 'click')
const mouseGum$ = fromEvent(gum, 'click')

const lineSubject =  new BehaviorSubject(false)
mouseClick$.pipe(tap(() => {


    lineSubject.next(!lineSubject.getValue())

})).subscribe();

const lineSubjectGum =  new BehaviorSubject(false)
mouseGum$.pipe(tap(() => {

    lineSubjectGum.next(!lineSubjectGum.getValue())
})).subscribe();

// const swapBtn = combineLatest(
//     lineSubject.asObservable().distinctUntilChanged())
//     // lineSubjectGum.asObservable().distinctUntilChanged()])
//     .subscribe()



function createInputStream(node) {
    return fromEvent(node, 'input')
        .pipe(
            pluck('target', 'value'),
            startWith(node.value)
        )
}

const lineWidth$ = createInputStream(range)
const strokeStyle$ = createInputStream(color)
// const strokeLine$ = createInputStream(line)


const lineState$ = lineSubject.asObservable();
const lineStateGum$ = lineSubjectGum.asObservable();



lineState$
    .pipe(skip(1))
    .pipe(tap((state) => line.classList.toggle('selected')))
    .subscribe();

lineStateGum$
    .pipe(skip(1))
    .pipe(tap((state) => gum.classList.toggle('selected')))
    .subscribe();



lineState$
    .pipe(filter(Boolean))

    .pipe(flatMap(() => {

        return mouseDown$

    })).pipe(
    withLatestFrom(lineWidth$, strokeStyle$,   (_, lineWidth,  strokeStyle, ) => {
        return {lineWidth,strokeStyle}
    })).pipe(flatMap((options) => {
        return combineLatest([mouseMove$.pipe(
            map( e =>({
                x: e.offsetX,
                y: e.offsetY,
                options
            })))

           .pipe(
               pairwise(),takeUntil(mouseUp$),takeUntil(mouseOut$)), of(options)
    ])

}))
    .pipe(tap(([[from, to], {lineWidth, strokeStyle}]) => {

    ctx.lineWidth = lineWidth
    ctx.strokeStyle = strokeStyle

    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()

})).subscribe()



const strokeGum$ = fromEvent(gum, 'click')
    .pipe(
        pluck('target', 'value'),
        tap(() => ctx.globalCompositeOperation = 'destination-out')

    )

const strokeClear$ = fromEvent(clear, 'click')
    .pipe(
        pluck('target', 'value'),
        tap(() => ctx.clearRect(0, 0, canvas.width, canvas.height))
    )


const steam$ = mouseDown$
    .pipe(
        withLatestFrom(strokeClear$, (_, strokeClear) => {
            return {strokeClear}
        })
    )
//
//
const gumim$ = mouseDown$
    .pipe(
        withLatestFrom(strokeGum$, (_, strokeGum) => {
            return {strokeGum}
        }))
gumim$.subscribe()
steam$.subscribe()




// function createInputStream(node) {
//     return fromEvent(node, 'input')
//         .pipe(
//             map(e => e.target.value),
//             startWith(node.value)
//         )
// }
//
// const lineWidth$ = createInputStream(range)
// const strokeStyle$ = createInputStream(color)
//
//


// const strokeLine$ = fromEvent(line, 'click')
//     .pipe(
//         pluck('target', 'value'),
//     )
//
//
//
// const stream$ = mouseDown$
//
// .pipe(
//
//     withLatestFrom(lineWidth$, strokeStyle$, strokeLine$,  (_, lineWidth,  strokeStyle, strokeLine) => {
//         return {lineWidth,strokeStyle,strokeLine}
//     }),
//     switchMap( options => {
//         return mouseMove$
//            .pipe(
//             map( e =>({
//                 x: e.offsetX,
//                 y: e.offsetY,
//                 options
//             })),
//             pairwise(),
//             takeUntil(mouseUp$),
//             takeUntil(mouseOut$)
//             )
//     })
// )
//

//     // const {} = from.options
//     // ctx.lineWidth = lineWidth
//     // ctx.strokeStyle = strokeStyle
//     //
//     // // ctx.globalCompositeOperation = 'destination-out'; // изменяем параметр, чтобы стиралось
//     // // ctx.fillStyle="rgba(255,255,255,1)"; // зададим белый цвет, чтобы проверить, что не закрашивается
//     // ctx.beginPath();
//     // // ctx.arc(120, 80, 70, 0, Math.PI*2, false)
//     // ctx.closePath();
//     // ctx.fill();
//
//
// stream$.subscribe(([from, to]) => {
//     const {lineWidth, strokeStyle} = from.options
//
//     ctx.lineWidth = lineWidth
//     ctx.strokeStyle = strokeStyle
//
//     ctx.beginPath()
//     ctx.moveTo(from.x, from.y)
//     ctx.lineTo(to.x, to.y)
//     ctx.stroke()
//
// })
//

//


