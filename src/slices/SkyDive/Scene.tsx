"use client";
import FloatingCan from "@/components/FloatingCan";

import { useRef } from "react";

import { Content } from "@prismicio/client";

import { Cloud, Clouds, Environment,  Text } from "@react-three/drei";
import * as THREE from 'three';

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useMediaQuery } from "@/hooks/useMediaQuerry";



gsap.registerPlugin(useGSAP, ScrollTrigger)

type SkyDiveProps = {
    sentence: string | null;
    flavor: Content.SkyDiveSliceDefaultPrimary["flavor"]
}
export const Scene = ({ sentence, flavor }: SkyDiveProps) => {
    const GroupRef = useRef<THREE.Group>(null);
    const CanRef = useRef<THREE.Group>(null);
    const Cloud1Ref = useRef<THREE.Group>(null);
    const Cloud2Ref = useRef<THREE.Group>(null);
    const CloudsRef = useRef<THREE.Group>(null);
    const wordsRef = useRef<THREE.Group>(null);

    const ANGLE = 75 * (Math.PI / 180);

    const getXPosition = (distance: number) => distance * Math.cos(ANGLE);
    const getYPosition = (distance: number) => distance * Math.sin(ANGLE);
    const getXYPosition = (distance: number) => ({
        x: getXPosition(distance),
        y: getYPosition(-1 * distance)
    });

    useGSAP(()=>{
        if(
            !CloudsRef.current || 
            !CanRef.current || 
            !wordsRef.current || 
            !Cloud1Ref.current || 
            !Cloud2Ref.current 

        ) return;

        // setting initial positions of the objects
        gsap.set(CloudsRef.current.position, {z: 10});
        gsap.set(CanRef.current.position, {
            ...getXYPosition(-4),
        })

        gsap.set(wordsRef.current.children.map((word)=> word.position), {
            ...getXYPosition(7),
            z: 2,
        });

        // making the can spin
        gsap.to(CanRef.current.rotation, {
            y: Math.PI * 2,
            duration: 1.7,
            repeat: -1,
            ease: "none",
        });


        // cloud movement
        const DISTANCE = 15;
        const DURATION = 6;

        gsap.set([Cloud2Ref.current.position, Cloud1Ref.current.position], {
            ...getXYPosition(DISTANCE)
        });

        gsap.to(Cloud1Ref.current.position, {
            y: `+=${getYPosition(DISTANCE * 2)}`,
            x: `+=${getXPosition(DISTANCE * -2)}`,
            ease: "none",
            repeat: -1,
            duration: DURATION
        });
        
        gsap.to(Cloud2Ref.current.position, {
            y: `+=${getYPosition(DISTANCE * 2)}`,
            x: `+=${getXPosition(DISTANCE * -2)}`,
            ease: "none",
            repeat: -1,
            delay: DURATION / 2,
            duration: DURATION
        });


        const scrollTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".skydive",
                pin: true,
                start: "top top",
                end: "+=2000",
                scrub: 1.5
            }
        });

        scrollTl.to("body", {
            backgroundColor: "#C0F0F5",
            overwrite: "auto",
            duration: 0.1,
        }).to(CloudsRef.current.position, {
            z: 0,
            duration: 0.3,
        }, 0).to(CanRef.current.position, {
            x: 0 ,
            y: 0 ,
            duration: 0.3,
            ease: "back.out(1.7)"
        }).to(wordsRef.current.children.map((word)=>word.position), {
            keyframes: [
                {x: 0, y: 0, z: -1},
                {...getXYPosition(-7), z: -7}
            ],
            stagger: 0.3,
        }, 0).to(CanRef.current.position, {
            ...getXYPosition(4),
            duration: 0.5,
            ease: "back.in(1.7)",
        }).to(CloudsRef.current.position, {
            z: 7,
            duration: 0.5,

        })
    });

    return (
        <group ref={GroupRef}>
            {/* cans */}
            <group rotation={[0, 0, 0.5]} >
                <FloatingCan ref={CanRef} flavour={flavor}
                rotationIntensity={0}
                floatIntensity={3}
                floatSpeed={3}

                >
                    <pointLight intensity={30} color="#8C0413" decay={0.6} />
                </FloatingCan>
            </group>

            {/* clouds */}
            <Clouds ref={CloudsRef} material={THREE.MeshBasicMaterial}>
                <Cloud ref={Cloud1Ref} bounds={[10, 10, 2]} color="#9DDEFA" />
                <Cloud ref={Cloud2Ref} bounds={[10, 10, 2]} color="#9DDEFA" />
            </Clouds>

            {/* Text */}

            <group ref={wordsRef} >
                {sentence && <ThreeText sentence={sentence} color="#F97315"/>}
            </group>
            {/* lights */}
            <ambientLight intensity={2} color="#9DDEFA" />
            <Environment files="/hdr/field.hdr" environmentIntensity={1.5} />
        </group>
    )
}

function ThreeText({ sentence, color = "white" }: {
    sentence: string;
    color?: string;
}) {
    const words = sentence.toUpperCase().split(" ");
    const material = new THREE.MeshLambertMaterial();
    const isDesktop = useMediaQuery("(min-width: 950px)", true);

    return words.map((word: string, wordIndex: number) => (
        <Text 
        key={`${wordIndex}-${word}`}
        scale={isDesktop ? 1 : 0.5}
        color={ color }
        material={ material }
        font="/fonts/Alpino-Variable.woff"
        fontWeight={900}
        anchorX={"center"}
        anchorY={"middle"}
        characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ!,.?'+=_-"
        >
            {word}
        </Text>
    ))
} 