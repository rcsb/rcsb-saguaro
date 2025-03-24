declare module '*.css';
declare module '*.module.scss';
declare module '*.module.sass';
declare module '@d3fc/d3fc-sample';
declare module "*.json" {
    const value: any;
    export default value;
}
declare module "*.svg" {
    import {SVGProps} from "react";
    const content: React.FC<SVGProps<any>>;
    export default content;
}