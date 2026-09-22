"use client";

import {
    createContext,
    useContext,
    useState,
} from "react";

import {
    NextIntlClientProvider,
} from "next-intl";

import en from "../app/messages/en.json";
import pt from "../app/messages/pt.json";
import es from "../app/messages/es.json";
import fr from "../app/messages/fr.json";

const LanguageContext =
    createContext(null);

const messages = {
    en,
    pt,
    es,
    fr,
};

export function LanguageProvider({
    children,
    initialLocale = "en",
}) {
    const [locale, setLocale] =
        useState(initialLocale);

    function changeLanguage(
        newLocale
    ) {
        if (!messages[newLocale]) {
            return;
        }

        setLocale(newLocale);

        document.cookie =
            `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    }

    return (
        <LanguageContext.Provider
            value={{
                locale,
                changeLanguage,
            }}
        >
            <NextIntlClientProvider
                locale={locale}
                messages={
                    messages[locale]
                }
                timeZone="Europe/Lisbon"
            >
                {children}
            </NextIntlClientProvider>
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context =
        useContext(
            LanguageContext
        );

    if (!context) {
        throw new Error(
            "useLanguage must be used inside LanguageProvider"
        );
    }

    return context;
}