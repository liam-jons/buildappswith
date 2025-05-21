"use client";

import { cn } from "@/lib/utils";
import { SkillsTreeSectionProps } from "./types";
import { skillsData } from "./data";
import { motion } from "framer-motion";
// Import Image if needed later
// import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ChevronRight } from "lucide-react";

// Feature scroll container component based on the MagicUI pro template
interface FeatureScrollProps {
  direction: "ltr" | "rtl";
  imageSrc: string;
  children: React.ReactNode;
  topPosition?: string;
  imageAlt?: string;
  customContent?: React.ReactNode;
}

function FeatureScrollContainer({
  direction,
  children,
  imageSrc,
  imageAlt = "Learning progression",
  topPosition = "50%",
  customContent,
}: FeatureScrollProps) {
  const isLTR = direction === "ltr";

  return (
    <div className="w-full">
      <div className="lg:hidden flex flex-col gap-y-10">
        <div className={`w-full mx-auto mb-4 ${isLTR ? "order-1" : "order-2"}`}>
          {customContent || (
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-full max-w-[300px] mx-auto"
            />
          )}
        </div>
        <div className={isLTR ? "order-2" : "order-1"}>{children}</div>
      </div>
      <div className="hidden lg:grid lg:grid-cols-2 h-fit w-full justify-center items-start relative">
        <div
          className="sticky flex justify-center items-center"
          style={{ top: topPosition }}
        >
          {children}
        </div>
        <div
          className={`flex items-center justify-center h-fit ${isLTR ? "" : "row-start-1"}`}
        >
          {customContent || (
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-full max-w-[400px]"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function SkillsTreeSection({ 
  className,
  skills = skillsData
}: SkillsTreeSectionProps) {
  // Mapping of skill levels to images (would be better with actual images)
  // Use custom step boxes instead of phone images
  const getStepBox = (step: number, title: string) => {
    return (
      <div className="flex flex-col items-center justify-center bg-card border border-border rounded-xl shadow-md p-8 w-full h-full max-w-[300px] aspect-square">
        <div className="bg-primary/10 rounded-full p-4 mb-4">
          <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
            {step}
          </div>
        </div>
        <h4 className="text-xl font-medium text-center">{title}</h4>
      </div>
    );
  };

  return (
    <section 
      className={cn(
        "py-16 md:py-24 lg:py-32 relative overflow-hidden",
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            How It Works
          </motion.h2>
          <motion.p 
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Our platform connects you with experienced AI builders to guide your learning journey
          </motion.p>
        </div>

        <div className="flex flex-col gap-20 container">
          {skills.map((skill, index) => (
            <FeatureScrollContainer
              key={skill.title}
              topPosition="20%"
              direction={index % 2 === 0 ? "rtl" : "ltr"}
              imageSrc=""
              imageAlt={`${skill.title} illustration`}
              customContent={getStepBox(skill.level, skill.title)}
            >
              <div className="flex flex-col gap-4 max-w-sm mx-auto lg:mx-0 items-center justify-center lg:items-start lg:justify-start text-center lg:text-left">
                <div className="flex items-center">
                  <div className={cn(
                    "flex items-center justify-center rounded-full size-12 mr-3",
                    skill.isActive ? "bg-primary text-white" : "bg-secondary/50 text-primary/60"
                  )}>
                    {skill.icon}
                  </div>
                  <div className="flex flex-col items-start">
                    <div className="text-sm text-muted-foreground">Level {skill.level}</div>
                    <h3 className="text-2xl font-bold">{skill.title}</h3>
                  </div>
                </div>

                <p className="text-base text-muted-foreground">
                  {skill.description}
                </p>

                <div className="flex gap-2 w-full sm:w-auto">
                  {skill.isActive ? (
                    <Link 
                      href="/learning"
                      className="bg-primary text-white px-4 py-2 rounded-md flex items-center w-full sm:w-auto justify-center"
                    >
                      Start Learning <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  ) : (
                    <div className="bg-secondary/30 text-muted-foreground px-4 py-2 rounded-md flex items-center">
                      {skill.isCompleted ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                          Completed
                        </>
                      ) : (
                        <>
                          Coming Soon
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </FeatureScrollContainer>
          ))}
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/3 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
}