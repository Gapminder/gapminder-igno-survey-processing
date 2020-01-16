#!/usr/bin/env bash
set -e

cp .clasp.tpl.json .clasp.json
echo "* Deploying to SDG Questions DEV (for testing google apps scripts against) - https://docs.google.com/spreadsheets/d/1dWnGSxLDInOZYr3iIwqSYzAzMKLP-nkzQ_1x_9jNpkw/edit"
clasp setting rootDir "dist/sdgQuestions"
clasp setting scriptId "1bQD6A3KH6eE0kz89E5P9fW6fMyyJ6pCFAy6TTHym_s86amI8Nelu4n5H"
clasp push
# echo "* Deploying to SDG Questions - https://docs.google.com/spreadsheets/d/1XfAyo-0u1i3ttUe-OOAMftJwvJlQ212qMxdDT2kYzzE/edit"
# clasp setting scriptId "1_iS1x6xmQwubEMi94ergR5BDEdlaKMMH63xjCRWLVQbh0QvKMP2K6ti_"
# clasp push
echo "* Deploying to gs_combined DEV (for testing google apps scripts against) - https://docs.google.com/spreadsheets/d/1iCcYNB0MEPPVsQWFAVvc6EcNw3EiVSu8tpouzvUIhZ8/edit"
clasp setting rootDir "dist/gsCombined"
clasp setting scriptId "1Om9ff0iaCnshdrQ2XMNXHz-pW-2PST3TXGsNSbyLvCMFsyzH6V6TX5Y1"
clasp push
echo "* Deploying to gs_combined - https://docs.google.com/spreadsheets/d/1tV3DZcbyhLYL2vKD9yCnSmFaqdw_LwTlcr5AFdKl3ds/edit?folder=1RmT1moi73Gk1QEzcgU1l1TrvmtxCoYmK"
clasp setting scriptId "1N19ztz9YFWpqybkijCs38YHSp2vX0I11P3VXXbDk8Iad_SQI1GxQLCAA"
clasp push
