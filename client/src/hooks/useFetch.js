import { useCallback, useState } from "react";

const useFetch = () => {
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState(null);

    const doFetching = useCallback(async (url, requestConfig = null) => {
        setIsFetching(true);
        try {
            const response = await fetch(url, requestConfig);
            const data = await response.json();
            setIsFetching(false);
            if (response.status !== 200) throw new Error(data.error.message);
            setError(null);
            return data;
        } catch (error) {
            // console.log(error.message);
            setIsFetching(false);
            setError(error.message);
        }
    }, []);

    return [doFetching, isFetching, error];
};

export default useFetch;
