/* ============================================================
   utils.js
   DestinyServices OS
   Utilidades Globais (Corrigido)
   ============================================================ */ //[span_0](start_span)[span_0](end_span)

"use strict"; //[span_1](start_span)[span_1](end_span)

const Utils = (() => { //[span_2](start_span)[span_2](end_span)

    const currency = new Intl.NumberFormat( //[span_3](start_span)[span_3](end_span)
        "pt-BR", //[span_4](start_span)[span_4](end_span)
        {
            style: "currency", //[span_5](start_span)[span_5](end_span)
            currency: "BRL" //[span_6](start_span)[span_6](end_span)
        }
    );

    function uuid() { //[span_7](start_span)[span_7](end_span)
        return crypto.randomUUID(); //[span_8](start_span)[span_8](end_span)
    }

    function now() { //[span_9](start_span)[span_9](end_span)
        return new Date().toISOString(); //[span_10](start_span)[span_10](end_span)
    }

    function today() { //[span_11](start_span)[span_11](end_span)
        return new Date() //[span_12](start_span)[span_12](end_span)
            .toLocaleDateString("pt-BR"); //[span_13](start_span)[span_13](end_span)
    }

    function currencyFormat(value) { //[span_14](start_span)[span_14](end_span)
        return currency.format( //[span_15](start_span)[span_15](end_span)
            Number(value || 0) / 100 //[span_16](start_span)[span_16](end_span)
        );
    }

    function currencyToCents(value) { //[span_17](start_span)[span_17](end_span)
        if (typeof value === "number") { //[span_18](start_span)[span_18](end_span)
            return Math.round(value); //[span_19](start_span)[span_19](end_span)
        }
        if (!value) return 0; //[span_20](start_span)[span_20](end_span)

        let clean = String(value).replace(/[R$\s]/g, "").trim(); //[span_21](start_span)[span_21](end_span)

        if (clean.includes(",") && clean.includes(".")) { //[span_22](start_span)[span_22](end_span)
            clean = clean.replace(/\./g, "").replace(",", "."); //[span_23](start_span)[span_23](end_span)
        } else if (clean.includes(",")) { //[span_24](start_span)[span_24](end_span)
            clean = clean.replace(",", "."); //[span_25](start_span)[span_25](end_span)
        }

        const num = Number(clean); //[span_26](start_span)[span_26](end_span)
        return isNaN(num) ? 0 : Math.round(num * 100); //[span_27](start_span)[span_27](end_span)
    }

    function centsToNumber(value) { //[span_28](start_span)[span_28](end_span)
        return Number(value || 0) / 100; //[span_29](start_span)[span_29](end_span)
    }

    function onlyNumbers(value) { //[span_30](start_span)[span_30](end_span)
        return String(value) //[span_31](start_span)[span_31](end_span)
            .replace(/\D/g, ""); //[span_32](start_span)[span_32](end_span)
    }

    function cpfCnpj(value) { //[span_33](start_span)[span_33](end_span)
        value = onlyNumbers(value); //[span_34](start_span)[span_34](end_span)

        if (value.length <= 11) { //[span_35](start_span)[span_35](end_span)
            return value //[span_36](start_span)[span_36](end_span)
                .replace(/(\d{3})(\d{3})/, "$1.$2") //[span_37](start_span)[span_37](end_span)
                .replace(/(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") //[span_38](start_span)[span_38](end_span)
                .replace(/(\d{3})(\d{2})$/, "$1-$2"); //[span_39](start_span)[span_39](end_span)
        }

        return value //[span_40](start_span)[span_40](end_span)
            .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5"); //[span_41](start_span)[span_41](end_span)
    }

    function phone(value) { //[span_42](start_span)[span_42](end_span)
        value = onlyNumbers(value); //[span_43](start_span)[span_43](end_span)

        if (value.length === 11) { //[span_44](start_span)[span_44](end_span)
            return value.replace( //[span_45](start_span)[span_45](end_span)
                /^(\d{2})(\d{5})(\d{4})$/, //[span_46](start_span)[span_46](end_span)
                "($1) $2-$3" //[span_47](start_span)[span_47](end_span)
            );
        }

        return value.replace( //[span_48](start_span)[span_48](end_span)
            /^(\d{2})(\d{4})(\d{4})$/, //[span_49](start_span)[span_49](end_span)
            "($1) $2-$3" //[span_50](start_span)[span_50](end_span)
        );
    }

    function cep(value) { //[span_51](start_span)[span_51](end_span)
        value = onlyNumbers(value); //[span_52](start_span)[span_52](end_span)

        return value.replace( //[span_53](start_span)[span_53](end_span)
            /^(\d{5})(\d{3})$/, //[span_54](start_span)[span_54](end_span)
            "$1-$2" //[span_55](start_span)[span_55](end_span)
        );
    }

    function escape(text) { //[span_56](start_span)[span_56](end_span)
        return String(text) //[span_57](start_span)[span_57](end_span)
            .replaceAll("&", "&amp;") //[span_58](start_span)[span_58](end_span)
            .replaceAll("<", "&lt;") //[span_59](start_span)[span_59](end_span)
            .replaceAll(">", "&gt;") //[span_60](start_span)[span_60](end_span)
            .replaceAll('"', "&quot;") //[span_61](start_span)[span_61](end_span)
            .replaceAll("'", "&#39;"); //[span_62](start_span)[span_62](end_span)
    }

    function debounce(fn, delay = 300) { //[span_63](start_span)[span_63](end_span)
        let timer; //[span_64](start_span)[span_64](end_span)

        return (...args) => { //[span_65](start_span)[span_65](end_span)
            clearTimeout(timer); //[span_66](start_span)[span_66](end_span)

            timer = setTimeout( //[span_67](start_span)[span_67](end_span)
                () => fn(...args), //[span_68](start_span)[span_68](end_span)
                delay //[span_69](start_span)[span_69](end_span)
            );
        };
    }

    function sum(items, field) { //[span_70](start_span)[span_70](end_span)
        return items.reduce( //[span_71](start_span)[span_71](end_span)
            (total, item) => //[span_72](start_span)[span_72](end_span)
                total + Number(item[field] || 0), //[span_73](start_span)[span_73](end_span)
            0 //[span_74](start_span)[span_74](end_span)
        );
    }

    function clone(obj) { //[span_75](start_span)[span_75](end_span)
        return structuredClone(obj); //[span_76](start_span)[span_76](end_span)
    }

    function download(filename, content) { //[span_77](start_span)[span_77](end_span)
        const blob = new Blob( //[span_78](start_span)[span_78](end_span)
            [content], //[span_79](start_span)[span_79](end_span)
            { //[span_80](start_span)[span_80](end_span)
                type: "text/plain" //[span_81](start_span)[span_81](end_span)
            }
        );

        const url = URL.createObjectURL(blob); //[span_82](start_span)[span_82](end_span)

        const a = document.createElement("a"); //[span_83](start_span)[span_83](end_span)

        a.href = url; //[span_84](start_span)[span_84](end_span)

        a.download = filename; //[span_85](start_span)[span_85](end_span)

        a.click(); //[span_86](start_span)[span_86](end_span)

        URL.revokeObjectURL(url); //[span_87](start_span)[span_87](end_span)
    }

    function toast(message, type = "info") { //[span_88](start_span)[span_88](end_span)
        let container = document.querySelector( //[span_89](start_span)[span_89](end_span)
            ".toast-container" //[span_90](start_span)[span_90](end_span)
        );

        if (!container) { //[span_91](start_span)[span_91](end_span)
            container = document.createElement("div"); //[span_92](start_span)[span_92](end_span)
            container.className = //[span_93](start_span)[span_93](end_span)
                "toast-container"; //[span_94](start_span)[span_94](end_span)
            document.body.appendChild(container); //[span_95](start_span)[span_95](end_span)
        }

        const toastEl = document.createElement("div"); //[span_96](start_span)[span_96](end_span)
        toastEl.className = //[span_97](start_span)[span_97](end_span)
            "toast toast-" + type; //[span_98](start_span)[span_98](end_span)
        toastEl.textContent = message; //[span_99](start_span)[span_99](end_span)
        container.appendChild(toastEl); //[span_100](start_span)[span_100](end_span)

        setTimeout( //[span_101](start_span)[span_101](end_span)
            () => { //[span_102](start_span)[span_102](end_span)
                toastEl.remove(); //[span_103](start_span)[span_103](end_span)
            }, //[span_104](start_span)[span_104](end_span)
            3500 //[span_105](start_span)[span_105](end_span)
        );
    }

    return { //[span_106](start_span)[span_106](end_span)
        uuid, //[span_107](start_span)[span_107](end_span)
        now, //[span_108](start_span)[span_108](end_span)
        today, //[span_109](start_span)[span_109](end_span)
        currencyFormat, //[span_110](start_span)[span_110](end_span)
        currencyToCents, //[span_111](start_span)[span_111](end_span)
        centsToNumber, //[span_112](start_span)[span_112](end_span)
        onlyNumbers, //[span_113](start_span)[span_113](end_span)
        cpfCnpj, //[span_114](start_span)[span_114](end_span)
        phone, //[span_115](start_span)[span_115](end_span)
        cep, //[span_116](start_span)[span_116](end_span)
        escape, //[span_117](start_span)[span_117](end_span)
        debounce, //[span_118](start_span)[span_118](end_span)
        sum, //[span_119](start_span)[span_119](end_span)
        clone, //[span_120](start_span)[span_120](end_span)
        download, //[span_121](start_span)[span_121](end_span)
        toast //[span_122](start_span)[span_122](end_span)
    };

})();