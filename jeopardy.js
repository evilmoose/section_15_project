// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

const API_URL = "https://jservice.io/api/";
const COLUMNS = 6;
const SQUARES = 5;

let categories = [];


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    let res = await axios.get(`${API_URL}categories?count=100`);
    let IDs = res.data.map(c => c.id);
    
    return _.sampleSize( IDs, COLUMNS );

}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory( catId ) {
    let res = await axios.get( `${ API_URL }category?id=${ catId }` );
    let cat = res.data;
    let sqrs = cat.clues;
    let randomSqr = _.sampleSize(sqrs, SQUARES );
    let clues = randomSqr.map( c => ({
    question: c.question,
    answer: c.answer,
    showing: null,
  }));

  return { title: cat.title, clues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    $( "#jeopardy thead" ).empty();

    let $tr = $( "<tr>" );
    for ( let id = 0; id < COLUMNS; id++ ) {
        $tr.append( $( "<th>" ).text( categories[ id ].title ) );
    }
    
    $( "#jeopardy thead" ).append( $tr );

    $( "#jeopardy tbody" ).empty();
    for ( let sqr = 0;  sqr < SQUARES; sqr++ ) {
        let $tr = $( "<tr>" );
        
        for ( let id = 0; id < COLUMNS; id++ ) {
            $tr.append( $( "<td>" ).attr( "id", `${ id }-${ sqr }` ).text( "?" ) );
        }
        
        $("#jeopardy tbody").append($tr);
    }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(event) {
    let id                          = event.target.id;
    let [ categoryID, squareID ]    = id.split( "-" );
    let square                      = categories[ categoryID ].clues[ squareID ];

    let message;

    if ( !square.showing ) {
        message = square.question;
        square.showing = "question";
    }
    else if ( square.showing === "question" ) {
        message = square.answer;
        square.showing = "answer";
    }
    else {
        return;
    }

    $( `#${ categoryID }-${squareID}` ).html( message );
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {

}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    let categoryIDs = await getCategoryIds();

    categories = [];

    for ( let id of categoryIDs ) {
        categories.push( await getCategory( id ) );
    }

    fillTable();
}

/** On click of start / restart button, set up game. */

$( "#restart" ).on( "click", setupAndStart);

/** On page load, add event handler for clicking clues */

$( async function () {
    setupAndStart();
    $( "#jeopardy").on( "click", "td", handleClick );
});