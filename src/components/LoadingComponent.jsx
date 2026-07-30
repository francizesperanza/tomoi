import { animate, stagger, createScope, set, random, createTimeline} from 'animejs'
import { useEffect, useRef } from "react";

function LoadingComponent() {

    const root = useRef(null);
    const scope = useRef(null);

    useEffect(() => {

        scope.current = createScope({ root }).add( self => {
            const tl = createTimeline({defaults:{loop: true, duration:500}})

            tl.add('.letter', {
                opacity: {
                    to: [0, 1],
                    delay: stagger(50)
                },
                scale: {
                    to: [1.1, 1],
                    delay: stagger(100)
                }
            })
        });
        return () => scope.current.revert()

    }, []);

  return (
    <>
        <div ref={root} className='flex'>
            <span className='flex'>
                <div className='letter'>L</div>
                <div className='letter'>o</div>
                <div className='letter'>a</div>
                <div className='letter'>d</div>
                <div className='letter'>i</div>
                <div className='letter'>n</div>
                <div className='letter'>g</div>
                <div className='letter'>.</div>
                <div className='letter'>.</div>
                <div className='letter'>.</div>
            </span>
        </div>
    </>
  )
}

export default LoadingComponent
