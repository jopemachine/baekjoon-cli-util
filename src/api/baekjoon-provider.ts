import open from 'open';
import got from 'got';
import {load} from 'cheerio';
import {APIProvider} from '../api-provider.js';
import {Problem} from '../problem.js';
import {Test} from '../test.js';

class BackjoonProvider extends APIProvider {
	async fetchProblemInfo(problem: Problem) {
		const result = await got(`https://www.acmicpc.net/problem/${problem.problemId}`);
		return load(result.body);
	}

	async openProblem(problem: Problem) {
		return open(`https://www.acmicpc.net/problem/${problem.problemId}`, {wait: false});
	}

	async fetchTests(problem: Problem) {
		if (!problem.problemInfo) {
			problem.problemInfo = await this.fetchProblemInfo(problem);
		}

		const tests: Test[] = [];

		await problem.clearTests();

		for (let testIdx = 1; ; ++testIdx) {
			const sampleInput = problem.problemInfo(`#sample-input-${testIdx}`);
			const sampleOutput = problem.problemInfo(`#sample-output-${testIdx}`);
			const sampleInputTxt = sampleInput.text();
			const sampleOutputTxt = sampleOutput.text();

			if (!sampleInputTxt || !sampleOutputTxt) {
				break;
			}

			tests.push(
				new Test({
					testIdx,
					problemUId: problem.getProblemUId(),
					stdin: sampleInputTxt,
					expectedStdout: sampleOutputTxt,
				}),
			);
		}

		return tests;
	}

	async fetchProblemAttributes(problem: Problem) {
		if (!problem.problemInfo) {
			problem.problemInfo = await this.fetchProblemInfo(problem);
		}

		return {
			title: problem.problemInfo('#problem_title').text(),
		};
	}
}

export {
	BackjoonProvider,
};
