document.addEventListener("DOMContentLoaded", () => {
    loadJobs();
    setInterval(loadJobs, 60000); // Cập nhật mỗi phút (60000 ms)
});

document.getElementById("addJobBtn").addEventListener("click", async () => {
    const name = document.getElementById("jobName").value.trim();
    const url = document.getElementById("jobUrl").value.trim();
    const interval = document.getElementById("jobInterval").value;

    if (!name || !url || !interval) {
        alert("Please fill in all fields.");
        return;
    }

    // Gửi job đến backend
    const response = await fetch("http://localhost:3000/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url, interval }),
    });

    if (response.ok) {
        alert("Job added successfully!");
        loadJobs();
    } else {
        alert("Failed to add job.");
    }
});

async function loadJobs() {
    const jobList = document.getElementById("jobList");
    jobList.innerHTML = "";

    const response = await fetch("http://localhost:3000/api/jobs");
    const jobs = await response.json();

    if (jobs.length === 0) {
        jobList.innerHTML = `<p class="placeholder">No jobs scheduled yet.</p>`;
        return;
    }

    jobs.forEach(job => {
        const jobItem = document.createElement("div");
        jobItem.classList.add("job");
        jobItem.innerHTML = `
            <p><strong>${job.name}</strong> - Every ${job.interval} minute(s)</p>
            <p>URL: <span>${job.url}</span></p>
            <div class="job-status">
                <p>Status: <span class="${getStatusClass(job.status)}">${job.status}</span></p>
                <p>Last run: ${job.lastRun ? job.lastRun : "Not yet executed"}</p>
            </div>
        `;
        jobList.appendChild(jobItem);
    });
}

function getStatusClass(status) {
    switch (status) {
        case "Running":
            return "running";
        case "Success":
            return "success";
        case "Failed":
            return "failed";
        default:
            return "";
    }
}
