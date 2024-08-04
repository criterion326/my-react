const axios = require('axios')

const fetchActivities = async (currentPage, pageSize, user_id, token) => {
    try {
        const response = await axios.get(
            `http://106.54.0.160:5001/api/activity/?currentPage=${currentPage}&pageSize=${pageSize}&activityStartTime=&activityEndTime=`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        console.log('response:', response.data)
        // const filteredData = response.data.result.data.filter(
        //     activity => activity.selectPublisher === user_id
        // )
        // response.data.result.data = filteredData
        return response.data
    } catch (error) {
        console.error('Error fetching activities:', error)
        throw new Error('Error fetching activities')
    } finally {
        console.log('fetchActivities function executed', currentPage, pageSize, user_id, token)
    }
}

module.exports = fetchActivities
