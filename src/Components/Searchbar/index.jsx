import React, { useRef, useState, useEffect } from "react";
import CustomTextField from "../Input/Textfield";

function SearchBar(props) {
    const parentRef = useRef(null);
    const { searchSuggestionList, selectedCompany, setSelectedCompany, width, handleCompanyNameChange } = props;

    const [inputValue, setInputValue] = useState("");
    const [filteredSuggestionList, setFilteredSuggestionList] = useState(searchSuggestionList || []);
    const [showSearchSuggestion, setShowSearchSuggestion] = useState(false);

    const handleInputFocus = () => {
        setShowSearchSuggestion(true);
    };

    const isQueryPresent = (userInput, item) => {
        const trimmedUserInput = userInput?.replace(/\s+/g, " ")?.trim()?.toLowerCase();
        return item?.companyName?.toLowerCase()?.includes(trimmedUserInput);
    };

    const handleInputChange = (val) => {
        const userInput = val;
        setShowSearchSuggestion(true);
        setInputValue(userInput);
        handleCompanyNameChange(val);

        if (userInput === "" || !userInput) {
            setFilteredSuggestionList(searchSuggestionList);
        } else {
            const filteredArray = searchSuggestionList.filter((item) => isQueryPresent(userInput, item));
            setFilteredSuggestionList(filteredArray);
        }
    };

    const handleSearchSuggestionClick = (value) => {
        setShowSearchSuggestion(false);
        if (!!value) {
            setFilteredSuggestionList(searchSuggestionList);
            setInputValue(value?.companyName);
            setSelectedCompany(value);
        }
    };

    const handleBlur = (e) => {
        setShowSearchSuggestion(false);
        if (!parentRef.current.contains(e.relatedTarget)) {
            setShowSearchSuggestion(false);
        }
    };

    useEffect(() => {
        setFilteredSuggestionList(searchSuggestionList);
    }, [searchSuggestionList]);

    useEffect(() => {
        handleSearchSuggestionClick(selectedCompany);
    }, [selectedCompany]);

    return (
        <div onMouseLeave={(e) => handleBlur(e)} style={{ width: width }} ref={parentRef} className="relative w-full mx-auto">
            <CustomTextField onFocus={handleInputFocus} label="Company name *" value={inputValue} onChange={(val) => handleInputChange(val)} fullWidth />

            {!!showSearchSuggestion && !!filteredSuggestionList && (
                <div className="absolute left-0 z-10 w-full max-h-[300px] overflow-auto bg-popover text-popover-foreground border border-t-0 border-border rounded-b-md shadow-md text-left">
                    {!!filteredSuggestionList?.length !== 0 && (
                        <ul className="p-2.5 list-none">
                            {filteredSuggestionList?.map((item) => {
                                return (
                                    <li key={item?._id || item?.companyName} className="cursor-pointer mb-5 last:mb-0 hover:bg-accent rounded px-2 py-1" onClick={() => handleSearchSuggestionClick(item)}>
                                        {item?.companyName}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default SearchBar;
