/* ============================================================
   pix.js
   DestinyServices OS
   PIX (Payload EMV + Copia e Cola)
   ============================================================ */

"use strict";

const Pix = (() => {

    function crc16(payload) {

        let crc = 0xFFFF;

        for (let i = 0; i < payload.length; i++) {

            crc ^= payload.charCodeAt(i) << 8;

            for (let j = 0; j < 8; j++) {

                if (crc & 0x8000) {

                    crc = (crc << 1) ^ 0x1021;

                } else {

                    crc <<= 1;

                }

                crc &= 0xFFFF;

            }

        }

        return crc

            .toString(16)

            .toUpperCase()

            .padStart(4, "0");

    }

    function field(id, value) {

        const size =

            String(value.length)

            .padStart(2, "0");

        return id + size + value;

    }

    function merchant(key, description) {

        return field(

            "26",

            field("00", "BR.GOV.BCB.PIX") +

            field("01", key) +

            (description

                ? field("02", description)

                : "")

        );

    }

    function generate(data) {

        const settings =

            Settings.get();

        const payload =

            field("00", "01") +

            field("01", "12") +

            merchant(

                settings.pix.key,

                data.description

            ) +

            field("52", "0000") +

            field("53", "986") +

            field(

                "54",

                (data.amount / 100)

                .toFixed(2)

            ) +

            field("58", "BR") +

            field(

                "59",

                settings.company.name

                .substring(0, 25)

            ) +

            field(

                "60",

                settings.company.city ||

                "BRASIL"

            ) +

            field(

                "62",

                field(
    function qrURL(payload) {

        return "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" +
            encodeURIComponent(payload);

    }

                )

            ) +

            "6304";

        return payload +

            crc16(payload);

    }

    async function copy(payload) {

        await navigator.clipboard.writeText(

            payload

        );

        Utils.toast(

            "PIX copiado.",

            "success"

        );

    }

    function qrURL(payload) {

        return

        "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" +

        encodeURIComponent(payload);

    }

    return {

        generate,

        copy,

        qrURL

    };

})();
