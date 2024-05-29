import React, { useRef, useState, useEffect } from "react";
import { TextField, MenuItem } from "@mui/material";

import { useTheme } from "@mui/material/styles";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import CustomTextField from "../Input/Textfield";
import styles from "./index.module.scss";

function SearchBar(props) {

    const parentRef = useRef(null);
    const { searchSuggestionList, selectedCompany, setSelectedCompany, width, handleCompanyNameChange } = props;

    const [inputValue, setInputValue] = useState("");
    const [filteredSuggestionList, setFilteredSuggestionList] = useState(searchSuggestionList || []);
    const [showSearchSuggestion, setShowSearchSuggestion] = useState(false);

    const handleInputFocus = () => {
        setShowSearchSuggestion(true);
    };

    // function to check if user searched query is present in a string
    const isQueryPresent = (userInput, item) => {
        const trimmedUserInput = userInput?.replace(/\s+/g, " ")?.trim()?.toLowerCase();
        return item?.companyName?.toLowerCase()?.includes(trimmedUserInput);
    };

    const filterJobBasedonName = (searchVal) => {
        return searchSuggestionList?.find((item) => item?.companyName?.toLowerCase() == searchVal?.toLowerCase());
    };

    // when user enter any input in search bar
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
        console.log("selectedCompany", selectedCompany);
        // if (!!selectedCompany && !!searchSuggestionList) {
        //     const companyData = filterJobBasedonName(selectedCompany?.companyName);
            handleSearchSuggestionClick(selectedCompany);
        // }
    }, [selectedCompany]);

    return (
        <div onMouseLeave={(e) => handleBlur(e)} style={{ width: width }} ref={parentRef} className={styles.searchbar}>
            <CustomTextField onFocus={handleInputFocus} label="Comapny name *" value={inputValue} onChange={(val) => handleInputChange(val)} fullWidth />

            {!!showSearchSuggestion && !!filteredSuggestionList && (
                <div className={styles.searchbar_suggesstion}>
                    {!!filteredSuggestionList?.length != 0 && (
                        <ul>
                            {filteredSuggestionList?.map((item) => {
                                return <li onClick={() => handleSearchSuggestionClick(item)}>{item?.companyName}</li>;
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default SearchBar;
