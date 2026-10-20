import { useEffect, useState } from 'react'
import './App.css'


function App() {

  const [emailText, setEmailText] = useState('')
  const [message, setMessage] = useState('')

  const [analysis, setAnalysis] = useState({
    project: '',
    actions: [],
    risks: [],
    deadlines: []
  })

  const [weeklyUpdates, setWeeklyUpdates] = useState([])



  // --------------------------------
  // SHORTEN TEXT FOR WEEKLY TRACKER
  // --------------------------------

  function shortenText(text) {

    let shortText = text.trim()


    // Remove common beginning words
    shortText = shortText.replace(/^please\s+/i, '')
    shortText = shortText.replace(/^we are\s+/i, '')
    shortText = shortText.replace(/^we're\s+/i, '')
    shortText = shortText.replace(/^the team\s+/i, '')


    // Change phrases like:
    // "Jordan needs to update..."
    // into:
    // "Update..."

    shortText = shortText.replace(
      /^[A-Za-z]+\s+needs to\s+/i,
      ''
    )


    shortText = shortText.replace(
      /^[A-Za-z]+\s+should\s+/i,
      ''
    )


    shortText = shortText.replace(
      /^[A-Za-z]+\s+must\s+/i,
      ''
    )


    // Capitalize first letter
    shortText =
      shortText.charAt(0).toUpperCase() +
      shortText.slice(1)


    // Remove ending period
    shortText = shortText.replace(/\.$/, '')


    return shortText
  }



  // --------------------------------
  // LOAD SAVED PROJECTS
  // --------------------------------

  useEffect(() => {

    const savedUpdates = JSON.parse(
      localStorage.getItem('emanage-updates')
    ) || []


    const sevenDaysAgo =
      Date.now() - (7 * 24 * 60 * 60 * 1000)


    const recentUpdates = savedUpdates.filter(
      update => update.createdAt > sevenDaysAgo
    )


    setWeeklyUpdates(recentUpdates)


    localStorage.setItem(
      'emanage-updates',
      JSON.stringify(recentUpdates)
    )

  }, [])



  // --------------------------------
  // SAVE WEEKLY PROJECTS
  // --------------------------------

  function saveUpdates(updates) {

    setWeeklyUpdates(updates)


    localStorage.setItem(
      'emanage-updates',
      JSON.stringify(updates)
    )
  }



  // --------------------------------
  // ANALYZE EMAIL
  // --------------------------------

  async function analyzeEmail() {

    if (emailText.trim() === '') {

      setMessage('Paste an email first!')

      return
    }


    setMessage('Analyzing...')


    try {

      const response = await fetch(
        'http://127.0.0.1:8001/analyze',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            text: emailText
          })
        }
      )


      const data = await response.json()


      setAnalysis(data)


      // Remove project title if it accidentally
      // appears inside actions

      const cleanedActions = data.actions.filter(
        action =>
          action.toLowerCase() !==
          data.project.toLowerCase()
      )


      const newUpdate = {

        id: Date.now(),

        project: data.project,

        actions: cleanedActions,

        risks: data.risks,

        deadlines: data.deadlines,

        createdAt: Date.now()

      }


      const updatedList = [
        newUpdate,
        ...weeklyUpdates
      ]


      saveUpdates(updatedList)


      setMessage(
        'Update analyzed and saved!'
      )


      setEmailText('')

    }

    catch (error) {

      console.error(error)

      setMessage(
        'Could not connect to the backend.'
      )

    }

  }



  // --------------------------------
  // DELETE PROJECT
  // --------------------------------

  function deleteUpdate(id) {

    const updatedList = weeklyUpdates.filter(
      update => update.id !== id
    )


    saveUpdates(updatedList)
  }



  // --------------------------------
  // DASHBOARD COUNTS
  // --------------------------------

  const activeProjects =
    weeklyUpdates.length


  const atRisk =
    weeklyUpdates.filter(
      update => update.risks.length > 0
    ).length


  const totalDeadlines =
    weeklyUpdates.reduce(

      (total, update) =>
        total + update.deadlines.length,

      0
    )


  const totalActions =
    weeklyUpdates.reduce(

      (total, update) =>
        total + update.actions.length,

      0
    )



  return (

    <div className="app">


      <h1>eManage</h1>



      {/* DASHBOARD CARDS */}

      <div className="cards">


        <div className="card">

          <h3>Active Projects</h3>

          <p>{activeProjects}</p>

        </div>



        <div className="card">

          <h3>At Risk</h3>

          <p>{atRisk}</p>

        </div>



        <div className="card">

          <h3>Upcoming Deadlines</h3>

          <p>{totalDeadlines}</p>

        </div>



        <div className="card">

          <h3>Open Actions</h3>

          <p>{totalActions}</p>

        </div>


      </div>



      {/* EMAIL INPUT */}

      <div className="email-section">

        <h2>Paste Email</h2>


        <textarea

          placeholder="Paste a project email or update here..."

          value={emailText}

          onChange={(event) =>
            setEmailText(event.target.value)
          }

        />


        <button onClick={analyzeEmail}>

          Run eAnalysis

        </button>


        {message && (

          <p className="message">

            {message}

          </p>

        )}


      </div>



      {/* FULL ANALYSIS */}

      <div className="analysis-section">

        <h2>eAnalysis</h2>


        <div className="analysis-grid">


          {/* PROJECT */}

          <div className="analysis-box">

            <h3>Project</h3>

            <p>

              {analysis.project ||
                'No project analyzed yet'}

            </p>

          </div>



          {/* ACTIONS */}

          <div className="analysis-box">

            <h3>Actions</h3>


            {analysis.actions.length > 0 ? (

              analysis.actions.map(
                (action, index) => (

                  <p key={index}>

                    • {action}

                  </p>

                )
              )

            ) : (

              <p>No actions found yet</p>

            )}


          </div>



          {/* RISKS */}

          <div className="analysis-box">

            <h3>Risks / Issues</h3>


            {analysis.risks.length > 0 ? (

              analysis.risks.map(
                (risk, index) => (

                  <p key={index}>

                    • {risk}

                  </p>

                )
              )

            ) : (

              <p>No risks found yet</p>

            )}


          </div>



          {/* DEADLINES */}

          <div className="analysis-box">

            <h3>Deadlines</h3>


            {analysis.deadlines.length > 0 ? (

              analysis.deadlines.map(
                (deadline, index) => (

                  <p key={index}>

                    • {deadline}

                  </p>

                )
              )

            ) : (

              <p>No deadlines found yet</p>

            )}


          </div>


        </div>

      </div>



      {/* WEEKLY PROJECT TRACKER */}

      <div className="weekly-section">

        <h2>Weekly Project Tracker</h2>

        <p className="weekly-description">

          Quick overview of projects
          from the last 7 days

        </p>



        {weeklyUpdates.length === 0 ? (

          <div className="empty-projects">

            <p>
              No project updates yet.
              Analyze an email to get started.
            </p>

          </div>

        ) : (

          weeklyUpdates.map(update => (

            <div
              className="weekly-project"
              key={update.id}
            >


              {/* PROJECT NAME + DELETE */}

              <div className="weekly-project-top">

                <h3>
                  {update.project}
                </h3>


                <button

                  className="delete-button"

                  onClick={() =>
                    deleteUpdate(update.id)
                  }

                >

                  Delete

                </button>

              </div>



              <div className="weekly-details">


                {/* QUICK TO DO */}

                <div>

                  <h4>To Do</h4>


                  {update.actions.length > 0 ? (

                    update.actions.map(
                      (action, index) => (

                        <p key={index}>

                          • {shortenText(action)}

                        </p>

                      )
                    )

                  ) : (

                    <p>
                      Nothing needed
                    </p>

                  )}

                </div>



                {/* QUICK RISKS */}

                <div>

                  <h4>Risks</h4>


                  {update.risks.length > 0 ? (

                    update.risks.map(
                      (risk, index) => (

                        <p key={index}>

                          • {shortenText(risk)}

                        </p>

                      )
                    )

                  ) : (

                    <p>
                      No current risks
                    </p>

                  )}

                </div>



                {/* QUICK DEADLINES */}

                <div>

                  <h4>Deadlines</h4>


                  {update.deadlines.length > 0 ? (

                    update.deadlines.map(
                      (deadline, index) => (

                        <p key={index}>

                          • {deadline}

                        </p>

                      )
                    )

                  ) : (

                    <p>
                      No deadline
                    </p>

                  )}

                </div>


              </div>


            </div>

          ))

        )}


      </div>


    </div>

  )
}


export default App