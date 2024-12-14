import { Toaster } from "react-hot-toast";

export default function ToasterCustom() {
  return (
    <Toaster
      position="bottom-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Define default options
        className: "text-sm",
        duration: 5000,
        style: {
          background: "#363636",
          color: "#fff",
        },

        // Default options for specific types
        success: {
          duration: 4000,
        },
        error: {
          duration: 4000,
        },
      }}
    />
  );
}
