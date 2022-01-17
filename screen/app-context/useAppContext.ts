import { useContext } from "react";
import { AppContext, AppContextProps } from "./AppContextProvider";

interface UseAppContextProps {

}

interface UseAppContext {
    context: AppContextProps;
}

const useAppContext = ({

}: UseAppContextProps): UseAppContext => {
    const context = useContext(AppContext);

    return {
        context
    }
}

export default useAppContext;