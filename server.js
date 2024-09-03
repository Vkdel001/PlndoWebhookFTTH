const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
    const webhookData = req.body;

    console.log('Webhook received:', webhookData);

    // Extract necessary values from the webhook data
    const happenedAt = webhookData?.context?.happened_at || 'Unknown';
    const templateName = webhookData?.job?.template?.name || 'Unknown';
    const submitID = webhookData?.job?.address?.apartment || 'Unknown';
    const outcome = webhookData?.job?.resolution?.successful || 'Unknown';
    const jobcomment = webhookData?.job?.resolution?.comment || 'Unknown';
    
    // Check if the template name is "FTTH"
    if (templateName === "FTTH-NSLD") {
        // Dynamically import node-fetch
        const fetch = await import('node-fetch').then(module => module.default);

        // Prepare the data for the POST request
        const postData = {
            appId: "FTT229730",
            workplaceId: "EMT052658",
            submissionId: submitID,
            requestingUserEmailAddress: "vikas.khanna@emtel.com",
            data: {
                completion: happenedAt,
                status_com: outcome,
                job_comment: jobcomment
            }
        };

        try {
            const response = await fetch('https://api-public-v3.clappia.com/submissions/edit', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-api-key': 'emt052658999e58772f1d44b7a920796d0863a90b'
                },
                body: JSON.stringify(postData)
            });

            const responseData = await response.json();
            console.log('Response from Clappia API:', responseData);

            res.status(200).send('Webhook received and processed');
        } catch (error) {
            console.error('Error making POST request:', error);
            res.status(500).send('Error processing webhook');
        }
    } else {
        console.log(`Template name is not FTTH, no action taken. Template name: ${templateName}`);
        res.status(200).send('Webhook received but no action taken');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
