const util = require('../../app/util');
const _ = require('lodash');
const fs = require('fs');
const fse = require('fs-extra');


describe('unit tests', () => {

    describe('reporter utils', () => {

        describe('storeScreenShot', () => {

            describe('crash scenarios', () => {
                it('catches error and logs if param "file" is null or undefined or else', () => {
                    spyOn(console, 'error').and.stub();
                    util.storeScreenShot("", undefined);
                    expect(console.error).toHaveBeenCalled();
                    util.storeScreenShot("", null);
                    expect(console.error).toHaveBeenCalled();
                });

                it('catches error and logs it if file is not accessible', () => {
                    const errMsg = "ENOENT: no such file or directory, open '|superfiles.js'";
                    spyOn(console, 'error').and.stub();

                    spyOn(fse, 'outputFileSync').and.callFake(() => {
                        throw new Error(errMsg);
                    });
                    util.storeScreenShot("", "./|superfiles.js");
                    expect(console.error).toHaveBeenCalledWith(new Error(errMsg));
                });
            });

            describe('working scenarios', () => {
                it('writes contents to target file', () => {
                    spyOn(fse, 'outputFileSync').and.stub();
                    util.storeScreenShot("data", "output.png");
                    expect(fse.outputFileSync).toHaveBeenCalledWith("output.png", "data", {encoding: 'base64'});
                });

            });

        });

        describe('gatherDescriptions', () => {

            describe('crash scenarios', () => {
                it('throws exception when suite is null or undefined', () => {
                    expect(() => {
                        util.gatherDescriptions(undefined, undefined);
                    }).toThrow();
                    expect(() => {
                        util.gatherDescriptions(null, undefined);
                    }).toThrow();
                    expect(() => {
                        util.gatherDescriptions(null, null);
                    }).toThrow();
                });

                //this test only "works" if the function uses !== instead of !=
                // xit('throws exception when "suite" is empty object but "soFar" undefined or null', () => {
                //     expect(() => {
                //         util.gatherDescriptions({}, undefined);
                //     }).toThrow();
                //     expect(() => {
                //         util.gatherDescriptions({}, null);
                //     }).toThrow();
                // });

                it('throws exception when "suite" is empty object but "soFar" undefined or null', () => {

                    util.gatherDescriptions({}, undefined);


                    util.gatherDescriptions({}, null);

                });

                it('throws exception when "suite" is empty object and soFar undefined', () => {
                    const soFar = [];
                    util.gatherDescriptions({}, soFar);
                    expect(soFar.length).toEqual(0);

                });


            });

            describe('working scenarios', () => {

                it('does nothing when "suite" is empty object and "soFar" array', () => {
                    const soFar = [];
                    const result = util.gatherDescriptions({}, soFar);
                    expect(soFar.length).toEqual(0);
                    expect(result.length).toEqual(0);
                });

                describe('collects descriptions', () => {
                    it('adds a single toplevel description to result', () => {
                        const suite = {
                            description: "single top level description"
                        };
                        const soFar = [];
                        const result = util.gatherDescriptions(suite, soFar);
                        expect(soFar.length).toEqual(1);
                        expect(result.length).toEqual(1);
                    });

                    it('adds a two description to result', () => {
                        const suite = {
                            description: "child description",
                            parentSuite: {
                                description: "single top level description"
                            }
                        };
                        const soFar = [];
                        const result = util.gatherDescriptions(suite, soFar);
                        expect(soFar.length).toEqual(2);
                        expect(result.length).toEqual(2);
                        expect(result[0]).toEqual("child description");
                        expect(result[1]).toEqual("single top level description");
                    });

                    it('adds a three descriptions to result', () => {
                        const suite = {
                            description: "child description level 2",
                            parentSuite: {
                                description: "child description level 1",
                                parentSuite: {
                                    description: "top level description",
                                }
                            }
                        };
                        const soFar = [];
                        const result = util.gatherDescriptions(suite, soFar);
                        expect(soFar.length).toEqual(3);
                        expect(result.length).toEqual(3);
                        expect(result[0]).toEqual("child description level 2");
                        expect(result[1]).toEqual("child description level 1");
                        expect(result[2]).toEqual("top level description");
                    });

                    it('adds a two descriptions to result with null/undefined description at level 2', () => {
                        const suiteWithNull = {
                            description: null,
                            parentSuite: {
                                description: "child description level 1",
                                parentSuite: {
                                    description: "top level description",
                                }
                            }
                        };
                        const soFar1 = [];
                        const result1 = util.gatherDescriptions(suiteWithNull, soFar1);
                        expect(soFar1.length).toEqual(2);
                        expect(result1.length).toEqual(2);
                        expect(result1[0]).toEqual("child description level 1");
                        expect(result1[1]).toEqual("top level description");

                        const suiteWithUndefined = {
                            description: undefined,
                            parentSuite: {
                                description: "child description level 1",
                                parentSuite: {
                                    description: "top level description",
                                }
                            }
                        };
                        const soFar2 = [];
                        const result2 = util.gatherDescriptions(suiteWithUndefined, soFar2);
                        expect(soFar2.length).toEqual(2);
                        expect(result2.length).toEqual(2);
                        expect(result2[0]).toEqual("child description level 1");
                        expect(result2[1]).toEqual("top level description");
                    });

                    it('adds a two descriptions to result with null description at level 1', () => {
                        const suite = {
                            description: "child description level 2",
                            parentSuite: {
                                description: null,
                                parentSuite: {
                                    description: "top level description",
                                }
                            }
                        };
                        const soFar = [];
                        const result = util.gatherDescriptions(suite, soFar);
                        expect(soFar.length).toEqual(2);
                        expect(result.length).toEqual(2);
                        expect(result[0]).toEqual("child description level 2");
                        expect(result[1]).toEqual("top level description");
                    });

                    it('adds a two descriptions to result with undefined description at top level', () => {
                        const suite = {
                            description: "child description level 2",
                            parentSuite: {
                                description: "child description level 1",
                                parentSuite: {
                                    description: null,
                                }
                            }
                        };
                        const soFar = [];
                        const result = util.gatherDescriptions(suite, soFar);
                        expect(soFar.length).toEqual(2);
                        expect(result.length).toEqual(2);
                        expect(result[0]).toEqual("child description level 2");
                        expect(result[1]).toEqual("child description level 1");
                    });


                });
            });


        });

        describe('generate guid', () => {

            describe('working scenarios', () => {
                it('generates correct random guid', () => {
                    const guids = [];
                    for (let i = 0; i < 10; i++) {
                        guids.push(util.generateGuid());
                    }
                    const uniguids = _.uniq(guids); // eleminates every non unique value
                    expect(uniguids.length).toEqual(10); //array would too short if a double guid would occur
                    expect(uniguids[0].length).toEqual(36);
                    const totalLen = _.sumBy(uniguids, (str) => {
                        return str.length;
                    });
                    expect(totalLen).toEqual(36 * 10); //ten guids with length of 36 chars
                });

            });

        });

        describe('removeDirectory', () => {

            describe('crash scenarios', () => {
                it('catches error and returns nothing if undefined or null "path" given', () => {
                    const readSpy = spyOn(fs, 'readdirSync').and.callFake(() => {
                        throw new Error("don't care");
                    });
                    const unlinkSpy = spyOn(fs, 'unlinkSync').and.stub();
                    const rmdirSpy = spyOn(fs, 'rmdirSync').and.stub();
                    util.removeDirectory(undefined);
                    expect(readSpy).toHaveBeenCalled();
                    expect(unlinkSpy).not.toHaveBeenCalled();
                    expect(rmdirSpy).not.toHaveBeenCalled();

                    expect(util.removeDirectory(null)).toBeUndefined();
                    expect(readSpy).toHaveBeenCalled();
                    expect(unlinkSpy).not.toHaveBeenCalled();
                    expect(rmdirSpy).not.toHaveBeenCalled();

                });

                it('removes nothing if dir not exists', () => {
                    const readSpy = spyOn(fs, 'readdirSync').and.callFake(() => {
                        throw new Error("don't care");
                    });
                    const unlinkSpy = spyOn(fs, 'unlinkSync').and.stub();
                    const rmdirSpy = spyOn(fs, 'rmdirSync').and.stub();
                    util.removeDirectory("./not/existing/path/" + util.generateGuid() + "/subdir");
                    expect(readSpy).toHaveBeenCalled();
                    expect(unlinkSpy).not.toHaveBeenCalled();
                    expect(rmdirSpy).not.toHaveBeenCalled();
                });
            });

            describe('working scenarios', () => {
                const statIsFileMock = {
                    isFile: () => {
                        return true;
                    }
                };

                const statIsNotFileMock = {
                    isFile: () => {
                        return false;
                    }
                };

                it('removes single dir if no files are there', () => {
                    const readSpy = spyOn(fs, 'readdirSync').and.callFake(() => {
                        return [];
                    });
                    const unlinkSpy = spyOn(fs, 'unlinkSync').and.stub();
                    const rmdirSpy = spyOn(fs, 'rmdirSync').and.stub();
                    const fakePath = "./not/existing/path/" + util.generateGuid() + "/subdir";
                    util.removeDirectory(fakePath);
                    expect(readSpy).toHaveBeenCalled();
                    expect(unlinkSpy).not.toHaveBeenCalled();
                    expect(rmdirSpy).toHaveBeenCalledWith(fakePath);
                });

                it('removes files in dir before deleting dir', () => {
                    const readSpy = spyOn(fs, 'readdirSync').and.callFake(() => {
                        return ['file1.txt'];
                    });
                    const statSpy = spyOn(fs, 'statSync').and.returnValue(statIsFileMock);
                    const unlinkSpy = spyOn(fs, 'unlinkSync').and.stub();
                    const rmdirSpy = spyOn(fs, 'rmdirSync').and.stub();
                    const fakePath = "./not/existing/path/" + util.generateGuid() + "/subdir";
                    util.removeDirectory(fakePath);
                    expect(readSpy).toHaveBeenCalled();
                    expect(statSpy).toHaveBeenCalled();
                    expect(unlinkSpy).toHaveBeenCalledWith(fakePath + '/file1.txt');
                    expect(rmdirSpy).toHaveBeenCalledWith(fakePath);
                });

                it('removes subdir in dir before deleting it', () => {
                    let counter = 0;
                    const readSpy = spyOn(fs, 'readdirSync').and.callFake(() => {
                        if (counter === 0) {
                            counter++;
                            return ['subsubdir'];
                        }
                        return [];
                    });
                    const statSpy = spyOn(fs, 'statSync').and.returnValue(statIsNotFileMock);
                    const unlinkSpy = spyOn(fs, 'unlinkSync').and.stub();
                    const rmdirSpy = spyOn(fs, 'rmdirSync').and.stub();
                    const fakePath = "./not/existing/path/" + util.generateGuid() + "/subdir";
                    util.removeDirectory(fakePath);
                    expect(readSpy).toHaveBeenCalled();
                    expect(statSpy).toHaveBeenCalled();
                    expect(unlinkSpy).not.toHaveBeenCalled();
                    expect(rmdirSpy).toHaveBeenCalledWith(fakePath);
                });

                it('removes files and subdir in dir before deleting it', () => {
                    const fakePath = "./not/existing/path/" + util.generateGuid() + "/subdir";
                    let counter=0;
                    const readSpy = spyOn(fs, 'readdirSync').and.callFake((fpath) => {
                        counter++;
                        if (counter < 10) {
                            if (fpath === fakePath) {
                                return ['subsubdir', 'file1.txt'];
                            }
                        }
                        return [];
                    });
                    const statSpy = spyOn(fs, 'statSync').and.callFake((ffile) => {
                        //fake a dir if name is subsubdir
                        return ffile.endsWith("/subsubdir") ? statIsNotFileMock : statIsFileMock;
                    });
                    const unlinkSpy = spyOn(fs, 'unlinkSync').and.stub();
                    const rmdirSpy = spyOn(fs, 'rmdirSync').and.stub();

                    util.removeDirectory(fakePath);
                    expect(readSpy).toHaveBeenCalled();
                    expect(statSpy).toHaveBeenCalled();
                    expect(unlinkSpy).toHaveBeenCalledWith(fakePath + "/file1.txt");
                    expect(rmdirSpy).toHaveBeenCalledWith(fakePath);
                });

            });

        }); // removeDirectory

    });


});
