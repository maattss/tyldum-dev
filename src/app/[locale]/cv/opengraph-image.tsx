// The CV page sets its own openGraph metadata, which drops the image inherited
// from the parent segment, so serve the same preview here.
export { default, alt, size, contentType, generateStaticParams } from "../opengraph-image";
